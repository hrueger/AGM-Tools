using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Security.AccessControl;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using DokanNet;
using DokanNet.Logging;
using Microsoft.Win32;
using Newtonsoft.Json;
using FileAccess = DokanNet.FileAccess;

namespace AGMToolsFS
{
    internal class AGMFS : IDokanOperations
    {
        #region DokanOperations member

        private readonly string apiUrl = "https://agmtools.allgaeu-gymnasium.de/AGM-Tools_NEU_API/";
        private readonly string userToken = "5cdfb84fa7227";
        private readonly int maxCacheSeconds = 1000;
        private readonly WebClient client = new WebClient();

        private Dictionary<string, int> projectsCache = new Dictionary<string, int>();
        private Dictionary<string, (int id, FileInformation finfo)> elementCache = new Dictionary<string, (int, FileInformation)>();
        private Dictionary<string, (dynamic Items, DateTime timeStamp)> apiCache  = new Dictionary<string, (dynamic Items, DateTime timeStamp)>();

        public dynamic GetWebAPI(string action, string args = "")
        {
            var result = "";
            if (args == "")
            {
                result = client.UploadString(this.apiUrl, "{\"action\": \"" + action + "\"}");
            } else
            {
                result = client.UploadString(this.apiUrl, "{\"action\": \""+action+"\",  \"args\":[{"+ args + "}]}");
            }
            //Console.WriteLine(result);
            //Console.WriteLine("das wars");
            dynamic data = JsonConvert.DeserializeObject(result);
            return data;
        }

        public AGMFS()
        {

            this.client.Headers.Add("user-agent", "AGM-Tools FS v0.0.1");
            this.client.Headers.Add("Authorization", $"Bearer {this.userToken}");
            var projects = this.GetWebAPI("projectsGetProjects");

            /*var items = this.GetWebAPI("filesGetFolder", "\"pid\": \"" + 26 + "\", \"fid\": \"-1\"");
            
            foreach (var item in items)
            {
                Console.WriteLine((string)item.name);
            }*/


            foreach (dynamic project in projects )
            {
                this.projectsCache.Add((string)project.name, (int)project.id);
                this.elementCache.Add($"\\{project.name}", (-1, new FileInformation
                {
                    FileName = project.name,
                    Attributes = FileAttributes.Directory,
                    LastAccessTime = DateTime.Now,
                    LastWriteTime = null,
                    CreationTime = null
                }));
            }
            
        }

        public void Cleanup(string filename, DokanFileInfo info)
        {
        }

        public void CloseFile(string filename, DokanFileInfo info)
        {
            if (this.elementCache.TryGetValue(filename, out var val))
            {
                if (this._fileCache.ContainsKey(val.id))
                {
                    this._fileCache.Remove(val.id);
                } else
                {

                }
            } else
            {
                
            }
            
        }

        public NtStatus CreateFile(
            string filename,
            FileAccess access,
            FileShare share,
            FileMode mode,
            FileOptions options,
            FileAttributes attributes,
            DokanFileInfo info)
        {
            if (info.IsDirectory && mode == FileMode.CreateNew)
                return DokanResult.AccessDenied;
            return DokanResult.Success;
        }

        public NtStatus DeleteDirectory(string filename, DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus DeleteFile(string filename, DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        

        public NtStatus FlushFileBuffers(
            string filename,
            DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus FindFiles(
            string filename,
            out IList<FileInformation> files,
            DokanFileInfo info)
        {
            //var fileInfo = new FileInfo(filename);
             files = new List<FileInformation>();
            
            if (filename == "\\") // Hauptverzeichnis
            {
                foreach (var name in this.projectsCache.Keys)
                {
                    var finfo = new FileInformation
                    {
                        FileName = name,
                        Attributes = FileAttributes.Directory,
                        LastAccessTime = DateTime.Now,
                        LastWriteTime = null,
                        CreationTime = null
                    };
                    files.Add(finfo);
                    
                }
                return DokanResult.Success;
            }
            else
            {
                string[] path = filename.Split(new Char[] { '\\'});
                var pid = this.projectsCache[path[1]];
                var fid = -1;
                //Console.WriteLine(filename);
                
                if (this.elementCache.ContainsKey(filename))
                {
                    fid = this.elementCache[filename].id;
                }

                dynamic items;
                var apikey = $"\"pid\": \"{pid}\", \"fid\": \"{fid}\"";
                if (this.apiCache.TryGetValue(apikey, out var x) && DateTime.UtcNow.Subtract(x.timeStamp).TotalSeconds < this.maxCacheSeconds)
                {
                    items = apiCache[apikey].Items;
                }
                else
                {
                    items = this.GetWebAPI("filesGetFolder", apikey);
                    this.apiCache.Add(apikey, (items, DateTime.UtcNow));
                }

                              


                foreach (var item in items) 
                {
                    long size = 0;
                    var rawsize = (string)item.rawsize;

                    size = string.IsNullOrEmpty(rawsize) ? 0 : Convert.ToInt64(rawsize);
                    FileInformation finfo;
                    if ((string)item.type == "file")
                    {
                        finfo = new FileInformation
                        {
                            FileName = (string)item.name,
                            Attributes = FileAttributes.Normal,
                            LastAccessTime = DateTime.Now,
                            LastWriteTime = null,//Convert.ToDateTime((string)item.modificationDate),
                            CreationTime = null,//Convert.ToDateTime((string)item.creationDate),
                            Length = size
                        };
                    } else
                    {
                        finfo = new FileInformation
                        {
                            FileName = (string)item.name,
                            Attributes = FileAttributes.Directory,
                            LastAccessTime = DateTime.Now,
                            LastWriteTime = null,//Convert.ToDateTime((string)item.modificationDate),
                            CreationTime = null,//Convert.ToDateTime((string)item.creationDate)
                        };
                        
                    }
                    files.Add(finfo);

                    var key = $"{filename}\\{item.name}";
                    if (!this.elementCache.ContainsKey(key))
                    {
                        this.elementCache.Add(key, ((int)item.id, finfo));
                    }

                    
                        

                }
                
                return DokanResult.Success;
                
            }
        }

        public NtStatus GetFileInformation(
            string filename,
            out FileInformation fileinfo,
            DokanFileInfo info)
        {
            
            fileinfo = new FileInformation {FileName = filename};
            if (filename == "\\")
            {
                
                fileinfo.Attributes = FileAttributes.Directory;
                fileinfo.LastAccessTime = DateTime.Now;
                fileinfo.LastWriteTime = null;
                fileinfo.CreationTime = null;

                return DokanResult.Success;
            }
            else
            {
                if (this.elementCache.TryGetValue(filename, out var val))
                {
                    fileinfo = val.finfo;
                    return DokanResult.Success;
                }
                else
                {
                    
                    return DokanResult.Error;
                }
            }
        }

        public NtStatus LockFile(
            string filename,
            long offset,
            long length,
            DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus MoveFile(
            string filename,
            string newname,
            bool replace,
            DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        private Dictionary<int, byte[]> _fileCache = new Dictionary<int, byte[]>();

        private Stream _currentStream;
        private string _currentFileName;

        public NtStatus ReadFile(
            string filename,
            byte[] buffer,
            out int readBytes,
            long offset,
            DokanFileInfo info)
        {
            if (info.Context == null)
            {
                //using (var stream = new FileStream(GetPath(fileName), FileMode.Open, System.IO.FileAccess.Read))
                //{
                //    stream.Position = offset;
                //    bytesRead = stream.Read(buffer, 0, buffer.Length);
                //}

                readBytes = 0;
                string[] path = filename.Split(new Char[] { '\\' });
                var pid = this.projectsCache[path[1]];
                //Console.WriteLine(filename);

                if (this.elementCache.ContainsKey(filename))
                {
                    var item = this.elementCache[filename];
                    var type = item.finfo.Attributes == FileAttributes.Normal ? "file" : "folder";
                    var url = $"{this.apiUrl}?get={item.id}&type={type}&token={this.userToken}&download";

                    // Geht aber nicht mit groﬂen Dateien

                    /*if (!this._fileCache.ContainsKey(item.id))
                    {
                        this._fileCache.Add(item.id, client.DownloadData(url));
                    }*/

                    //var fileContent = this._fileCache[item.id];

                    if (this._currentStream == null ||
                        this._currentStream.Position != offset ||
                        this._currentFileName == null ||
                        this._currentFileName != filename)
                    {
                        this._currentStream = new PartialHttpStream(url);
                        this._currentStream.Position = offset;
                        this._currentFileName = filename;
                    }

                    readBytes = this._currentStream.Read(buffer, 0, buffer.Length);
                    


                    return DokanResult.Success;

                }
            }
            else
            {
                readBytes = 0;
            }          

            return DokanResult.Error;
        }

        private Stream GetStream(string url, long position)
        {
            HttpWebRequest req = HttpWebRequest.CreateHttp(url);
            req.AddRange(position);
            HttpWebResponse response;
            try
            {
                response = (HttpWebResponse)req.GetResponse();
            }
            catch (WebException ex)
            {
                response = (HttpWebResponse)ex.Response;
                
                throw ex;
            }
            
            return response.GetResponseStream();
        }

        public NtStatus SetEndOfFile(string filename, long length, DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus SetAllocationSize(string filename, long length, DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus SetFileAttributes(
            string filename,
            FileAttributes attr,
            DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus SetFileTime(
            string filename,
            DateTime? ctime,
            DateTime? atime,
            DateTime? mtime,
            DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus UnlockFile(string filename, long offset, long length, DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus Mounted(DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus Unmounted(DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus GetDiskFreeSpace(
            out long freeBytesAvailable,
            out long totalBytes,
            out long totalFreeBytes,
            DokanFileInfo info)
        {
            var data = this.GetWebAPI("dashboardGetSpaceChartData");
            freeBytesAvailable = data[0] * 1024*1024;
            totalBytes = (data[0] + data[2]) * 1024*1024;
            totalFreeBytes = data[0] * 1024*1024;
            return DokanResult.Success;
        }

        public NtStatus WriteFile(
            string filename,
            byte[] buffer,
            out int writtenBytes,
            long offset,
            DokanFileInfo info)
        {
            writtenBytes = 0;
            return DokanResult.Success;
        }

        public NtStatus GetVolumeInformation(out string volumeLabel, out FileSystemFeatures features,
            out string fileSystemName, out uint maximumComponentLength, DokanFileInfo info)
        {
            volumeLabel = "AGM-Tools";
            features = FileSystemFeatures.None;
            fileSystemName = "AGM-Tools FileSystem";
            maximumComponentLength = 256;
            return DokanResult.Success;
        }

        public NtStatus GetFileSecurity(string fileName, out FileSystemSecurity security, AccessControlSections sections,
            DokanFileInfo info)
        {
            security = File.GetAccessControl(@"C:\Users\Hannes\Downloads\test.txt");
            return DokanResult.Success;
        }

        public NtStatus SetFileSecurity(string fileName, FileSystemSecurity security, AccessControlSections sections,
            DokanFileInfo info)
        {
            return DokanResult.Success;
        }

        public NtStatus EnumerateNamedStreams(string fileName, IntPtr enumContext, out string streamName,
            out long streamSize, DokanFileInfo info)
        {
            streamName = string.Empty;
            streamSize = 0;
            return DokanResult.NotImplemented;
        }

        public NtStatus FindStreams(string fileName, out IList<FileInformation> streams, DokanFileInfo info)
        {
            streams = new FileInformation[0];
            return DokanResult.NotImplemented;
        }

        public NtStatus FindFilesWithPattern(string fileName, string searchPattern, out IList<FileInformation> files,
            DokanFileInfo info)
        {
            files = new FileInformation[0];
            return DokanResult.NotImplemented;
        }

        #endregion DokanOperations member
    }

    internal class Program
    {
        private static void Main()
        {
            try
            {
                var rfs = new AGMFS();
                rfs.Mount("a:\\", DokanOptions.FixedDrive, new NullLogger());
                Console.WriteLine(@"Success");
            }
            catch (DokanException ex)
            {
                Console.WriteLine(@"Error: " + ex.Message);
            }
        }
    }
}