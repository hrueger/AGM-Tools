using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Security.AccessControl;
using DokanNet;
using Microsoft.Win32;
using Newtonsoft.Json;
using FileAccess = DokanNet.FileAccess;

namespace AGMToolsFS
{
    internal class AGMFS : IDokanOperations
    {
        #region DokanOperations member

        private readonly string apiUrl = "https://agmtools.allgaeu-gymnasium.de/AGM-Tools_NEU_API/";
        private readonly string userToken = "Bearer 5cdfb84fa7227";
        private readonly WebClient client = new WebClient();

        private Dictionary<string, int> projects = new Dictionary<string, int>();

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
            this.client.Headers.Add("Authorization", this.userToken);
            var projects = this.GetWebAPI("projectsGetProjects");

            /*var items = this.GetWebAPI("filesGetFolder", "\"pid\": \"" + 26 + "\", \"fid\": \"-1\"");
            
            foreach (var item in items)
            {
                Console.WriteLine((string)item.name);
            }*/


            foreach (dynamic project in projects )
            {
                this.projects.Add((string)project.name, (int)project.id);
            }
            
        }

        public void Cleanup(string filename, DokanFileInfo info)
        {
        }

        public void CloseFile(string filename, DokanFileInfo info)
        {
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
            return DokanResult.Error;
        }

        public NtStatus DeleteFile(string filename, DokanFileInfo info)
        {
            return DokanResult.Error;
        }

        

        public NtStatus FlushFileBuffers(
            string filename,
            DokanFileInfo info)
        {
            return DokanResult.Error;
        }

        public NtStatus FindFiles(
            string filename,
            out IList<FileInformation> files,
            DokanFileInfo info)
        {
            files = new List<FileInformation>();
            
            if (filename == "\\") // Hauptverzeichnis
            {
                foreach (var name in projects.Keys)
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
                var pid = projects[path[1]];
                var fid = "-1";
                Console.WriteLine(filename);
                
                var items = this.GetWebAPI("filesGetFolder", "\"pid\": \"" + pid + "\", \"fid\": \""+fid+"\"");

                /*if (String.IsNullOrEmpty(path[2]))
                { // Haputprojektverzeichnis
                    items = this.GetWebAPI("filesGetFolder", "\"pid\": \"" + pid + "\", \"fid\": \"-1\"");
                } else
                { // Projektunterverzeichnis
                    items = this.GetWebAPI("filesGetFolder", "\"pid\": \"" + pid + "\", \"fid\": \"1842\"");
                }*/

                foreach (var item in items) 
                {
                    long size = 0;
                    var rawsize = (string)item.rawsize;
                    if (String.IsNullOrEmpty(rawsize))
                    {
                        size = 0;
                    } else
                    {
                        size = Convert.ToInt64(rawsize);
                        
                    }
                    if ((string)item.type == "file")
                    {
                        files.Add(new FileInformation
                        {
                            FileName = (string)item.name,
                            Attributes = FileAttributes.Normal,
                            LastAccessTime = DateTime.Now,
                            LastWriteTime = null,//Convert.ToDateTime((string)item.modificationDate),
                            CreationTime = null,//Convert.ToDateTime((string)item.creationDate),
                            Length = size
                        });
                    } else
                    {
                        files.Add(new FileInformation
                        {
                            FileName = (string)item.name,
                            Attributes = FileAttributes.Directory,
                            LastAccessTime = DateTime.Now,
                            LastWriteTime = null,//Convert.ToDateTime((string)item.modificationDate),
                            CreationTime = null,//Convert.ToDateTime((string)item.creationDate)
                        });
                    }
                    
                }
                
                return DokanResult.Success;
                /*foreach (var name in key.GetSubKeyNames())
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
                foreach (var name in key.GetValueNames())
                {
                    var finfo = new FileInformation
                    {
                        FileName = name,
                        Attributes = FileAttributes.Normal,
                        LastAccessTime = DateTime.Now,
                        LastWriteTime = null,
                        CreationTime = null
                    };
                    files.Add(finfo);
                }
                return DokanResult.Success;*/
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

            
           return DokanResult.Error;

            fileinfo.Attributes = FileAttributes.Directory;
            fileinfo.LastAccessTime = DateTime.Now;
            fileinfo.LastWriteTime = null;
            fileinfo.CreationTime = null;

            return DokanResult.Success;
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
            return DokanResult.Error;
        }

        public NtStatus ReadFile(
            string filename,
            byte[] buffer,
            out int readBytes,
            long offset,
            DokanFileInfo info)
        {
            readBytes = 0;
            return DokanResult.Error;
        }

        public NtStatus SetEndOfFile(string filename, long length, DokanFileInfo info)
        {
            return DokanResult.Error;
        }

        public NtStatus SetAllocationSize(string filename, long length, DokanFileInfo info)
        {
            return DokanResult.Error;
        }

        public NtStatus SetFileAttributes(
            string filename,
            FileAttributes attr,
            DokanFileInfo info)
        {
            return DokanResult.Error;
        }

        public NtStatus SetFileTime(
            string filename,
            DateTime? ctime,
            DateTime? atime,
            DateTime? mtime,
            DokanFileInfo info)
        {
            return DokanResult.Error;
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
            freeBytesAvailable = (data[0] - data[2]) * 1024*1024;
            totalBytes = data[0] * 1024*1024;
            totalFreeBytes = (data[0] - data[2]) * 1024*1024;
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
            return DokanResult.Error;
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
            security = null;
            return DokanResult.Error;
        }

        public NtStatus SetFileSecurity(string fileName, FileSystemSecurity security, AccessControlSections sections,
            DokanFileInfo info)
        {
            return DokanResult.Error;
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
                rfs.Mount("a:\\"/*, DokanOptions.DebugMode | DokanOptions.StderrOutput*/);
                Console.WriteLine(@"Success");
            }
            catch (DokanException ex)
            {
                Console.WriteLine(@"Error: " + ex.Message);
            }
        }
    }
}