# Changelog


### Thu Feb 27 2020
- (feature) added missing translations
- (change) rich text in task email
- (change) notifications sent via email
- (feature) added markdown renderer
- (fix) fix android build for now
- (fix) fixed markdown displayed in tutorial editor
- (fix) fixed markdown displayed in tutorial editor
- (feature) added to html conversion
- (feature) added rich text to tutorial steps and descriptions
- (feature) added sample docker-compose file
- (fix) fixed size of image in chat message
- (change) moved from google maps to mapbox
- (change) moved from request to node-fetch
- (improvement) updated containerizer and bumped version

### Wed Feb 26 2020
- (feature) added rich text to template descriptions
- (improvement) better task list style
- (feature) added rich text to project and task descriptions
- (fix) fixed some styles
- (feature) added missing translation
- (fix) fixed position of close button
- (fix) fixed colors
- (change) removed weird ssl certificate fix
- (change) notification content can be rich text now
- (version) bumped version
- (feature) added markdown compatibility

### Tue Feb 25 2020
- (fix) fix self issued document server certificates
- (feature) added new config
- (fix) fixed build
- (feature) feat added document conversion option

### Mon Feb 24 2020
- (improvement) better file viewer design
- (change) removed secrets
- (fix) fixed ci build errors
- (fix) fixed linting errors
- (change) minimizations
- (feature) added fullscreen file viewer and document editor

### Sat Feb 22 2020
- (change) prevent toast duplicates
- (version) bumped version
- (change) longer login sessions

### Thu Feb 20 2020
- (fix) fixed deleting weird files problem

### Wed Feb 19 2020
- (fix) fixed bug
- (fix) fixed error
- (fix) fixed version error
- (feature) feat updater and bumped version
- (feature) feat updater

### Mon Feb 10 2020
- (fix) fixed file upload always to current folder

### Fri Feb 07 2020
- (change) Angular 9 (#49)
- (fix) fixed linting error
- (improvement) updated packages

### Tue Feb 04 2020
- (fix) fixed linting error
- (feature) feat send mail when creating task
- (feature) added send multiple mail function
- (fix) fixed color and allowed html in content
- (fix) fixed missing translations
- (fix) fixed task titles displayed wrong

### Mon Feb 03 2020
- (fix) fixed crash when email doesn't exist
- (fix) fixed npm run prod: file not found
- (fix) fixed mail templates path when build
- (feature) new mail system

### Sun Feb 02 2020
- (feature) feat sort files (web)
- (fix) fixed extracted folder always in root (api)

### Fri Jan 31 2020
- (version) bumped version
- (fix) fixed translation (web)
- (feature) feat extract zip files (web, api)

### Thu Jan 30 2020
- (fix) fixed file tree not updated
- (feature) added file tree (web)
- (fix) fixed build errors
- (fix) fixed linting error
- (fix) fixed typo

### Wed Jan 29 2020
- (feature) added default language option
- (feature) feat settings and language switch (web, api)

### Tue Jan 28 2020
- (change) more info and fixed badge
- (change) translated alert service
- (fix) fixed translation missing (web)
- (change) moved to master branch
- (change) removed wrong containerizer.json file

### Mon Jan 27 2020
- (change) changed to master branch
- (fix) fixed projects not showing
- (fix) fixed linting error (api)
- (feature) feat display  tasks on dashboard (web, api)
- (feature) feat added tasks (api, web)
- (feature) feat send mail to all users (web)
- (fix) fixed serious bug
- (change) formatted time (web)
- (feature) added navigating from projects to linked tutorials
- (improvement) updated project image tip info
- (change) supporting all image filetypes for project logo
- (fix) fixed translation (web)
- (fix) fixed missing translation

### Sun Jan 26 2020
- (fix) fix creating files and folders (api)
- (feature) added logo to login page (web)
- (change) cleaned up, changed logo
- (fix) fixed favicon (web)
- (fix) fixed errors when no cache is served (web)
- (feature) feat choose usergroup when adding user (web, api)
- (change) formatted timestamps (web)
- (fix) fixed module not found (api)
- (fix) fixed placeholder image asset path (api)
- (improvement) better navigation on mobile (web)

### Sat Jan 25 2020
- (fix) fix
- (fix) fixed migrations
- (feature) added docker badge
- (feature) added license
- (change) debug
- (change) autorun db migrations (api)
- (fix) fixed translation file url when in subfolder

### Fri Jan 24 2020
- (feature) added containerizer config
- (change) removed printing config
- (change) printing config for debugging

### Thu Jan 23 2020
- (fix) fix cleanup temp after file uploaded successfully
- (fix) fix creating dirs if not existing (api)

### Tue Jan 21 2020
- (fix) fixed int string config problem
- (change) security: never send password hashes to client
- (fix) fixed int string config problem

### Mon Jan 20 2020
- (improvement) updated packages (api)
- (improvement) updated packages (web / mobile)
- (change) moved relative time calculations to client
- (feature) added placeholder
- (change) cleanup
- (feature) added refrences.d.ts
- (feature) added translations for download service
- (fix) fixed wrong port in server started message
- (feature) added download (templates) (mobile)

### Wed Jan 15 2020
- (change) reading application port now from config
- (feature) added create secrets script (api)
- (change) removed howLongAgo from api removed default import from config
- (change) moved database config into secret config.ts
- (feature) added gitkeep to config dir
- (change) flattened config and moved it to gitignore
- (change) moved i18n files to assets

### Tue Jan 14 2020
- (change) moved firebase config
- (change) moved api to /api and served static frontend build

### Mon Jan 13 2020
- (fix) fixed file linking (projects) (web)
- (feature) added moving (files) (web & api)

### Sun Jan 12 2020
- (fix) fixed btn color (files) (web)
- (change) display 4 in a row (projects) (web)
- (fix) fixed linting errors (vfs)
- (feature) added vfs

### Sat Jan 11 2020
- (change) now using trial license (vfs)
- (improvement) update
- (change) initial commit (vfs)

### Thu Jan 09 2020
- (feature) added view ability (tutorials) (mobile)
- (fix) fixed title wrong (edit tutorial) (web)
- (feature) added url schemes

### Wed Jan 08 2020
- (change) native share dialog (files) (mobile) instead of link copied to clipboard
- (feature) added app shortcuts
- (fix) fixed missing await (tutorials) (web)
- (change) renamed language key
- (feature) new api (templates) (mobile)
- (fix) fixed linting error (dashboard) (mobile)
- (fix) fixed typo
- (change) translation and new api (notifications) (mobile)
- (fix) fixed notification display (dashboard) (mobile)
- (fix) fixed new (notifications) (mobile)
- (change) translation (templates) (mobile)
- (change) translation (projects) (mobile)
- (change) translation (notifications) (mobile)
- (change) translation (done) (mobile)
- (change) translation (chat-messages) (mobile)
- (change) translation (chat) (mobile)
- (change) translation (calendar) (mobile)
- (change) removed unnecessary clientsoftware component
- (change) removed unnecessary about component (now in settings in the about section)
- (change) translation (new user) (mobile)
- (change) translation (new project) (mobile)
- (change) translation (new notification) (mobile)
- (change) translation (new event) (mobile)
- (change) translation (edit user) (mobile)
- (change) translation (contact picker) (mobile)
- (feature) added translations

### Tue Jan 07 2020
- (fix) fixed typos and translated files (mobile)
- (fix) fixed deleting (files) (mobile)
- (fix) fixed renaming (files) (mobile)
- (fix) fixed share link generation (files) (mobile)
- (fix) fixed download (files) (mobile)
- (fix) fixed tags (files) (mobile)
- (feature) added new file / folder ability (files) (mobile)
- (feature) added view ability (files) (mobile)
- (feature) added 3rd party licenses
- (feature) added static controller (api)
- (fix) fixed local cache used (generate 3rd party license info)
- (feature) added view ability (settings) (web)

### Sun Jan 05 2020
- (change) view functionality (settings) (mobile)
- (feature) new structure (projects) (mobile)
- (fix) fixed primary color (mobile)

### Sat Jan 04 2020
- (fix) fixed linting errors (call) (mobile)
- (fix) fixed linting error (chat) (web)
- (change) started adding call functionality (web)

### Thu Jan 02 2020
- (change) started adding video / audio call functionality
- (improvement) updated packages
- (feature) added location sending (chat) (mobile)
- (change) custom status bar color

### Wed Jan 01 2020
- (fix) fixed linting error (chat) (mobile)
- (feature) added location message display (chat) (mobile)
- (fix) fixed linting error (push service) (mobile)
- (fix) fixed translation (lastOnline) (en)
- (feature) new api (chat) (mobile)

### Tue Dec 31 2019
- (fix) fixed linting errors
- (feature) added linting (mobile)
- (improvement) updated required node version
- (fix) fixed linting errors
- (feature) added modal transition (notifications) (mobile)
- (feature) added modal transition (projects) (mobile)
- (feature) added modal transition (templates) (mobile)
- (feature) added modal transition (users) (mobile)
- (feature) added modal transition (calendar) (mobile)
- (improvement) updated style (new user modal) (mobile)
- (improvement) updated style (new project modal) (mobile)
- (improvement) updated style (new notification modal) (mobile)
- (improvement) updated style (new event modal) (mobile)
- (improvement) updated style (edit user modal) (mobile)
- (improvement) updated style (contact picker) (mobile)
- (improvement) better style (action bar) (mobile)

### Sun Dec 29 2019
- (feature) new api (calendar) (mobile)
- (change) translated (calendar) (mobile)
- (change) active page indicator (sidedrawer) (mobile)
- (feature) new theme (users) (mobile)
- (feature) new theme (mobile)
- (feature) new api (users) (mobile)
- (feature) new style (sidedrawer) (mobile)
- (fix) fixed linting errors (dashboard) (mobile)
- (feature) added countdown (dashboard) (mobile)
- (change) more reusable code
- (fix) fixed login (web)
- (feature) added missing translation
- (fix) fixed error at error handling
- (change) translated tour

### Sat Dec 28 2019
- (change) more animations
- (change) translated login
- (fix) fixed calendar (breaking api change)
- (improvement) better error handling, fixed login
- (improvement) updated packages, translated dashboard, new api for dashboard

### Sun Dec 22 2019
- (change) allowed dev cleartext traffic
- (fix) fixed linting error

### Sat Dec 21 2019
- (improvement) updated emoji picker plugin
- (fix) fixed linting error
- (fix) fixed typo
- (change) changed all buttons to outline buttons

### Fri Dec 20 2019
- (fix) fixed message box in scroll view
- (fix) fixed files add link
- (change) moved tips to project detail page
- (feature) added file linking to projects
- (change) removed chocolatey as it is preinstalled

### Thu Dec 19 2019
- (feature) added filepicker component
- (fix) fixed linux cant find entities
- (feature) added missing jpeg icon
- (change) Fixed package-lock.json
- (fix) fixed error on logout and login
- (change) Merge pull request #20 from hrueger/greenkeeper/default/@syncfusion/ej2-angular-schedule-17.4.39
- (improvement) updated workflow to use node 12

### Wed Dec 18 2019
- (fix) fixed navbar error
- (feature) added clickable project card headers
- (fix) fixed: navigation not working after logged in
- (feature) added project detail page

### Tue Dec 17 2019
- (change) temporarily disabled firebase push service
- (fix) fixed labels is not defined
- (change) moved things out of constructor
- (fix) fixed linting errors
- (feature) new project structure
- (fix) fixed missing property
- (change) removed environment

### Mon Dec 16 2019
- (fix) fixed config because of moving api
- (change) started working on mobile app

### Sat Dec 14 2019
- (change) translated api

### Fri Dec 13 2019
- (change) more clean up
- (change) cleaned up, fixed api path for github actions
- (change) removed old api and moved v2 to root of api folder
- (feature) added translation plugin, changed hardcoded strings to translatable strings added german, engliscsh translation

### Mon Dec 09 2019
- (change) refactored navigation
- (fix) fixed going back to projects via breadcrumbs
- (fix) fixed folders in breadcrumbs appearing twice
- (fix) fixed navigating from files back to projects
- (improvement) updated packages
- (change) ngx-onlyoffice module from npm
- (change) started adding document editor

### Sun Dec 08 2019
- (change) started adding new redesigned project module

### Fri Dec 06 2019
- (fix) fixed buffer deprecation warning
- (fix) fixed cursor on logout link
- (change) removed bug component
- (fix) fixed api key
- (change) try hiding key from gitguardian ;-)
- (fix) fixed api key into config
- (fix) fixed linting error
- (feature) added attachment posibilities (right now only location)

### Thu Dec 05 2019
- (fix) fixed linting error
- (improvement) better avatar style

### Tue Dec 03 2019
- (change) Greenkeeper/default/@nstudio/nativescript pulltorefresh 1.1.1 (#15)

### Mon Dec 02 2019
- (feature) added basic chat functionality
- (change) Greenkeeper/default/core js 3.4.6 (#12)

### Sun Dec 01 2019
- (change) removed table header of action button
- (change) removed table headers of action buttons
- (change) delete button red

### Sat Nov 30 2019
- (feature) added template functionality
- (feature) added quick action buttons
- (fix) fixed file renaming
- (fix) fixed linting error
- (feature) added share functionality
- (feature) added file download
- (fix) fixed open file via context menu
- (feature) added next or previous file buttons
- (change) removed secure request pipe, file display in modal window

### Thu Nov 28 2019
- (fix) fixed linting errors
- (change) files working

### Sat Nov 23 2019
- (improvement) better update button style no notifications message aligned correctly new no events message
- (fix) fixed linting errors
- (change) finalized notification module

### Fri Nov 22 2019
- (fix) fix random number not saved
- (feature) added random value so lastUpdated column works
- (improvement) better theme chooser style
- (change) performance improvements when deleting entries
- (fix) fixed linting error
- (change) secure image loading with jwt auth
- (improvement) better tutorial style
- (improvement) better tutorial cards
- (fix) fix gh actions build fail
- (improvement) better event style

### Thu Nov 21 2019
- (fix) fixed linting
- (change) enhanced dashboard
- (fix) fixed event display
- (fix) fixed linting
- (change) fancy html emails with  templates

### Wed Nov 20 2019
- (change) finalized projects module
- (fix) fixed linting
- (feature) added default timeouts
- (change) finalized calendar module
- (change) started adding jwt renew interceptor

### Tue Nov 19 2019
- (feature) added password reset
- (feature) added genID() function
- (change) removed unnecessary spec ts files
- (change) plural names for all api endpoints

### Mon Nov 18 2019
- (feature) added todo list
- (feature) added reset password send mail
- (feature) added missing jwt token middleware
- (fix) fixed linting errors
- (change) finalized tutorials module

### Sun Nov 17 2019
- (change) finalized users module
- (fix) fixed linting script
- (feature) added linting
- (fix) fix linting errors
- (change) finalized dashboard
- (change) replaced api url by environment constant
- (fix) fix mobile build

### Sat Nov 16 2019
- (change) more skeleton and dashboard almost working

### Fri Nov 15 2019
- (feature) added apiUrl to default environment
- (fix) fixed relation
- (change) moved api url from config to enviromnent
- (feature) added entities
- (feature) added api skeleton

### Wed Nov 13 2019
- (feature) added screenshots and more info
- (fix) fixed language tag
- (feature) added github pages site

### Tue Nov 12 2019
- (fix) fix: remove old css file ref
- (fix) fixed theme new version
- (feature) added typescript to greenkeeper's ignore list
- (change) decreased typescript version because of angular compiler
- (change) cleaned up
- (change) cleaned up
- (fix) fix 22 finally ;-)
- (fix) fix 21
- (fix) fix 20
- (change) noew base64 input
- (fix) fixed star displayed as list
- (feature) added readme info
- (fix) fix 19

### Mon Nov 11 2019
- (fix) fix 18
- (feature) added support for overwriting file contents
- (fix) fix 18
- (fix) fix 17
- (feature) added script for creating secret placeholder files
- (fix) fix 16
- (fix) fix 15
- (fix) fix 14
- (fix) fix 13
- (fix) fix 12
- (fix) fix 11
- (fix) fix 10
- (fix) fix 9
- (fix) fix 8
- (fix) fixed error when username contains no spaces
- (fix) fix 7
- (fix) fix 6
- (fix) fix 5
- (fix) fix 4
- (fix) fix 3
- (fix) fix 2
- (fix) fix
- (change) manual build tools install
- (feature) added windows build tools
- (fix) fixed build action
- (feature) added build action
- (change) named step
- (fix) fixed working dir
- (fix) fixted working dir
- (change) created lint action
- (fix) fixed linting errors
- (feature) added new scripts
- (change) moved file system component to other repo
- (feature) added sw to gitignore
- (feature) added environment files to gitignore
- (change) removed unnecessesary stuff
- (change) Added readme
- (feature) added google-services to gitignore because of api key
- (feature) added secret to gitignore
- (change) removed secret keys
- (change) removed secret keys
- (change) tests

### Tue Oct 08 2019
- (fix) fixed menu on mobile

### Tue Oct 01 2019
- (version) bumped version
- (fix) fixed empty tutorial errors
- (improvement) updater works for devices below android 8
- (fix) fixed updater and camera plugin
- (change) auto updater working on android x

### Mon Sep 30 2019
- (feature) added navigating in settings
- (improvement) better style
- (change) great speed improvements through markingMode: none
- (improvement) updated all packages to latest version

### Sun Sep 29 2019
- (change) sub settings
- (improvement) better chat layout and style
- (feature) feature: navigate to event by click on dashboard list
- (fix) fixed date display name wrong and new style
- (feature) new paceholder message
- (fix) fixed scroll issue
- (change) finished tutorials
- (feature) added tutorials

### Sat Sep 28 2019
- (fix) fixed html displayed incorrectly
- (feature) added update and delete support
- (feature) added copy contact to clipboard
- (fix) fixed typo
- (feature) added image lightbox for chat added contact display in chat
- (change) prevented users from sending empty messages
- (fix) fixed flickering
- (change) dark style

### Tue Sep 24 2019
- (feature) added settings category logic
- (change) hide drawer on settings click
- (feature) added done message and navbar
- (change) started adding new updater
- (change) chat improvements

### Mon Sep 23 2019
- (fix) fixed date-fns breaking change error
- (feature) added new letter avatars
- (fix) fixed error
- (change) brought back old light core theme
- (improvement) updated all dependencies

### Sun Sep 22 2019
- (fix) fixed html <br> displayed incorrectly
- (feature) added calendar create and update functionality

### Thu Sep 19 2019
- (fix) fixed image loading scroll issue tried new chat layout with gridlayout instead of flexbox
- (change) removed icons from old emoji picker

### Tue Sep 17 2019
- (change) using new emojipicker plugin

### Sun Sep 15 2019
- (feature) added received and seen on the fly
- (feature) added new message display for groups
- (improvement) better info message
- (feature) new version
- (feature) added updater and new version display in login

### Fri Sep 13 2019
- (change) moved updater into _components
- (feature) added updater files
- (change) finalized contacts send, receive and display

### Thu Sep 12 2019
- (change) get contacts from modal
- (feature) added contacts
- (feature) added contacts

### Wed Sep 11 2019
- (feature) added contacts,  images preview, mediafilepicker,  multidex
- (change) contacts with unread and seen status

### Mon Sep 09 2019
- (feature) added image display in chat
- (feature) added attachment support in chat fontend

### Sun Sep 08 2019
- (fix) fixed translations
- (fix) fixed make messages received
- (fix) fixed scrolling new messages appear in chat directly
- (change) cleanup
- (feature) added template description and name at preview

### Sat Sep 07 2019
- (improvement) better image viewer
- (fix) fixed text spacing issues
- (feature) added tour done -> back

### Thu Sep 05 2019
- (feature) added tour design, logic
- (feature) added settings, logout button
- (feature) added tour component

### Wed Sep 04 2019
- (feature) added pull to refresh
- (fix) fixed ts warning (it won't parse the .tns file)
- (feature) new sidedrawer header appearance
- (change) removed clientsoftware from navigation
- (improvement) better modal style
- (fix) fixed linting errors in nativescript files
- (feature) added build script added ngx-slides better chat performance better chat style new login page page navigation transitions
- (feature) added build script
- (change) moved dockerfile because of build context

### Mon Sep 02 2019
- (change) moved shared out of api
- (change) almost working
- (change) removed pipe module
- (feature) added php config
- (fix) fixed run error
- (change) removed unneccessary packages
- (fix) fixed app name

### Sun Sep 01 2019
- (feature) added docker image
- (change) started implementing functionality in the received callback
- (fix) fixed push messages to muliple receivers
- (feature) added event notifier cron job
- (fix) fixed sidebar style
- (change) push working in browser using firebase
- (improvement) updated platform version, removed unused package nativescript and nativescript-onesignal
- (change) moved functions to library

### Fri Aug 23 2019
- (change) push notifications
- (fix) fixed continuation error and linting issues

### Thu Aug 22 2019
- (change) did some experiments
- (change) moved from OneSignal to Firebase
- (fix) fixed warning

### Wed Aug 21 2019
- (fix) fixed feof() error
- (fix) fixed assets folder path
- (fix) fixed remaining  linting errors
- (change) autofixed linting errors
- (change) removed e2e

### Tue Aug 20 2019
- (change) switched to plugin from npm
- (feature) new tslint

### Mon Aug 19 2019
- (change) removed double assets folder
- (change) preparing for emojipicker plugin

### Sat Aug 17 2019
- (improvement) updates
- (change) many improvements

### Fri Aug 16 2019
- (feature) added emojis
- (change) cleaned up better ui tabview icons work now

### Thu Aug 15 2019
- (change) moved to tab view icons are displayed

### Wed Aug 14 2019
- (improvement) updates for emoji picker

### Tue Aug 13 2019
- (change) started implementing emoji picker
- (feature) added emoji picker
- (change) finalized chat view

### Mon Aug 12 2019
- (change) many improvements
- (fix) fixed fab button position on landscape view mode

### Sat Aug 10 2019
- (improvement) updates
- (change) changes
- (change) geht, aber langsam, word nicht

### Fri Aug 09 2019
- (change) daniel's version
- (improvement) updates

### Thu Aug 08 2019
- (change) browsing feature complete
- (change) started implementing download
- (improvement) updated node_modules

### Tue Aug 06 2019
- (change) many improvements

### Sun Aug 04 2019
- (feature) added calendar add date

### Fri Aug 02 2019
- (feature) added many features

### Wed Jul 31 2019
- (change) many improvements

### Mon Jul 29 2019
- (feature) added download, share, rename, delete
- (change) removed unused code
- (fix) fixed router
- (change) changed styles
- (feature) new dashboard layout

### Sun Jul 28 2019
- (fix) fixed back bug added contextmenu added tags added reload functionality
- (feature) added pdfjsviewer
- (change) moved routing initialisation added contextmenu, pdfjsviewer
- (change) removed backup

### Fri Jul 26 2019
- (change) changed alerts to toasts added onesignal service ability to add bugs ability to remove bugs chat time and date fixed chat status icons at parner messages shown fixed removed clientsoftware mobile apps added template upload functionality added logout fixed logout login ngondestroy bug

### Thu Jul 25 2019
- (feature) added notifications in dashboard added emoji picker fixed chat send messages changed messages table to utf8mb4
- (improvement) updated npm modules, added file view on mobile, new login style on mobile

### Mon Jul 22 2019
- (change) several improvements

### Mon Jul 01 2019
- (change) changed login pic
- (feature) added headlines to modules
- (fix) fixed calendar, added uploader

### Sun Jun 30 2019
- (feature) added user, notification logic
- (feature) added logic
- (feature) added logic
- (fix) fixed bg img
- (feature) added new calendar

### Wed Jun 26 2019
- (change) several improvements

### Tue May 28 2019
- (feature) added timestamp and system messages for chat
- (fix) fixed icons
- (fix) fixed icons
- (change) format
- (feature) added chat logic and template
- (fix) fixed table style and icons
- (improvement) updated packages

### Sat May 25 2019
- (fix) fixed locale, added clientsoftware, bugs, files and templates
- (feature) added getFile and getTemplate
- (feature) added cache for browser
- (feature) added templates show
- (feature) added file display logic
- (feature) added display clientsoftware
- (feature) added display bugs
- (feature) added done component
- (feature) added done component
- (change) changed font

### Fri May 24 2019
- (change) started adding files on web
- (fix) fixed line breaks
- (feature) added new project git implementation

### Wed May 22 2019
- (change) improved things

### Tue May 21 2019
- (feature) added git test
- (feature) added better logs
- (fix) fixed cache on angular web bug
- (feature) added files
- (feature) added fullcalendar

### Mon May 20 2019
- (feature) added icons and background images
- (feature) added bg image
- (fix) fixed chat remote service error
- (fix) fixed core-js error
- (feature) added message icons
- (fix) fixed cache for web

### Sat May 18 2019
- (change) removed unnecessary model files
- (fix) fixed chat messages sender swapped
- (feature) added notifications, users, calendar, projects, remoteService, cache, chat v2

### Thu May 16 2019
- (change) some imporovments, eg cache

### Wed May 15 2019
- (feature) added calendar, navigation, chat

### Wed May 08 2019
- (improvement) update

### Sun May 05 2019
- (feature) added various features

### Sat May 04 2019
- (change) changed icons
- (feature) added navigation functionality
- (feature) added side drawer and icons
- (change) Initial commit
