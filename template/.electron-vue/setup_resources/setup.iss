#define MyAppName "_name_"
#define MyAppAliasName "_appName_"
#define MyAppVersion "_version_"
#define MyAppPublisher "_appPublisher_"
#define MyAppURL "_appURL_"
#define MyAppExeName "_name_.exe"
#define OutputPath "_outputPath_"
#define OutputFileName "_outputFileName_"
#define SourceMain "_filesPath_\_name_.exe"
#define SourceFolder "_filesPath_\*"
#define LicenseFilePath "_resourcesPath_\license.txt"
#define SetupIconFilePath "_icon_"
#define MyAppId "_appId_"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppAliasName}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\{#MyAppAliasName}
;LicenseFile={#LicenseFilePath}
OutputDir={#OutputPath}
OutputBaseFilename={#OutputFileName}
SetupIconFile={#SetupIconFilePath}
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
Uninstallable=yes
UninstallDisplayName={#MyAppAliasName}
DefaultGroupName={#MyAppAliasName}

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce
Name: "startupicon"; Description: "{cm:AutoStartProgram}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce; 

[Files]
Source: {#SourceMain}; DestDir: "{app}"; Flags: ignoreversion
Source: {#SourceFolder}; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Messages]
SetupAppTitle={#MyAppAliasName} setup wizard
SetupWindowTitle={#MyAppAliasName} setup wizard

[Icons]
Name: "{commondesktop}\{#MyAppAliasName}"; Filename: "{app}\{#MyAppExeName}"; Parameters:"--disable-pinch";Tasks: desktopicon
Name: "{commonstartup}\{#MyAppAliasName}"; Filename: "{app}\{#MyAppExeName}";Parameters:"--disable-pinch"; Tasks: startupicon
Name: "{group}\{#MyAppAliasName}"; Filename: "{app}\{#MyAppExeName}"; Parameters:"--disable-pinch"
Name: "{group}\uninstall {#MyAppAliasName}"; Filename: "{uninstallexe}"


[Languages]
Name: "chinese"; MessagesFile: "_resourcesPath_\ChineseSimp.isl"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppAliasName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
// Kill the process before installation
function InitializeSetup(): Boolean;
  var ErrorCode: Integer;
  begin
    ShellExec('open','taskkill.exe','/f /im {#MyAppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
    ShellExec('open','tskill.exe',' {#MyAppAliasName}','',SW_HIDE,ewNoWait,ErrorCode);
    result := True;
  end;

// Kill the process before uninstall
function InitializeUninstall(): Boolean;
  var ErrorCode: Integer;
  begin
    ShellExec('open','taskkill.exe','/f /im {#MyAppExeName}','',SW_HIDE,ewNoWait,ErrorCode);
    ShellExec('open','tskill.exe',' {#MyAppAliasName}','',SW_HIDE,ewNoWait,ErrorCode);
    result := True;
  end;
