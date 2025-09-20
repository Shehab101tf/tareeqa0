; 🚀 Tareeqa POS - Windows 7 Deployment Installer
; Compatible with NSIS 3.x and Electron 11.5.0

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "x64.nsh"
!include "WinVer.nsh"

; Product Information
!define PRODUCT_NAME "Tareeqa POS"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Tareeqa Technologies"
!define PRODUCT_WEB_SITE "http://tareeqa-pos.com"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\TareeqaPOS.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; Installer Configuration
Name "${PRODUCT_NAME}"
OutFile "TareeqaPOS-Setup.exe"
InstallDir "$PROGRAMFILES\Tareeqa POS"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel admin

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "ProductVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileDescription" "نظام نقاط البيع المتقدم للشركات المصرية"
VIAddVersionKey "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "LegalCopyright" "© 2024 Tareeqa Technologies"

; Modern UI Configuration
!define MUI_ABORTWARNING
!define MUI_ICON "resources\icon.ico"
!define MUI_UNICON "resources\icon.ico"

; Language Configuration
!define MUI_LANGDLL_ALLLANGUAGES
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Arabic"

; Language Strings
LangString DESC_SecMain ${LANG_ENGLISH} "Main application files"
LangString DESC_SecMain ${LANG_ARABIC} "ملفات التطبيق الأساسية"
LangString DESC_SecShortcuts ${LANG_ENGLISH} "Desktop and Start Menu shortcuts"
LangString DESC_SecShortcuts ${LANG_ARABIC} "اختصارات سطح المكتب وقائمة ابدأ"

; Initialization Function
Function .onInit
  ; Check Windows Version
  ${IfNot} ${AtLeastWin7}
    MessageBox MB_ICONSTOP|MB_TOPMOST "❌ هذا البرنامج يتطلب Windows 7 SP1 أو أحدث.$\r$\n❌ This software requires Windows 7 SP1 or higher."
    Abort
  ${EndIf}
  
  ; Language Selection
  !insertmacro MUI_LANGDLL_DISPLAY
  
  ; Check if application is already running
  System::Call 'kernel32::CreateMutex(i 0, i 0, t "TareeqaPOSInstaller") i .r1 ?e'
  Pop $R0
  StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "المثبت يعمل بالفعل.$\r$\nInstaller is already running."
    Abort
FunctionEnd

; Main Installation Section
Section "!${PRODUCT_NAME}" SEC01
  SectionIn RO
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  ; Install main application files
  File /r "dist\*.*"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninst.exe"
  
  ; Registry entries
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\TareeqaPOS.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\TareeqaPOS.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegDWORD ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "NoModify" 1
  WriteRegDWORD ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "NoRepair" 1
  
  ; Windows 7 Compatibility Settings
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\TareeqaPOS.exe" "HIGHDPIAWARE WIN7RTM"
SectionEnd

; Dependencies Section
Section "Visual C++ Redistributables" SEC02
  SetOutPath "$TEMP"
  
  ; Install appropriate VC++ redistributable
  ${If} ${RunningX64}
    File "vcredist_x64.exe"
    DetailPrint "Installing Visual C++ Redistributable (x64)..."
    ExecWait '"$TEMP\vcredist_x64.exe" /quiet /norestart' $0
    Delete "$TEMP\vcredist_x64.exe"
  ${Else}
    File "vcredist_x86.exe"
    DetailPrint "Installing Visual C++ Redistributable (x86)..."
    ExecWait '"$TEMP\vcredist_x86.exe" /quiet /norestart' $0
    Delete "$TEMP\vcredist_x86.exe"
  ${EndIf}
  
  ${If} $0 != 0
    DetailPrint "Warning: Visual C++ installation returned code $0"
  ${EndIf}
SectionEnd

; Shortcuts Section
Section "اختصارات - Shortcuts" SEC03
  ; Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\TareeqaPOS.exe"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\إلغاء التثبيت - Uninstall.lnk" "$INSTDIR\uninst.exe"
  
  ; Desktop shortcut
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\TareeqaPOS.exe"
SectionEnd

; Section Descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC01} $(DESC_SecMain)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC03} $(DESC_SecShortcuts)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Uninstaller
Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "هل أنت متأكد من إلغاء تثبيت ${PRODUCT_NAME}؟$\r$\nAre you sure you want to uninstall ${PRODUCT_NAME}?" IDYES +2
  Abort
FunctionEnd

Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "تم إلغاء تثبيت ${PRODUCT_NAME} بنجاح.$\r$\n${PRODUCT_NAME} was successfully uninstalled."
FunctionEnd

Section Uninstall
  ; Remove files and directories
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"
  
  ; Remove registry entries
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  DeleteRegValue HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\TareeqaPOS.exe"
  
  SetAutoClose true
SectionEnd
