; 🚀 Tareeqa POS - Complete Windows 7+ Installer
; Single file installer with all features
; Blocks Vista & older, installs VC++ redists, Arabic + English UI

!include "MUI2.nsh"
!include "x64.nsh"
!include "WinVer.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"

;--------------------------------
; Product Information
;--------------------------------
!define PRODUCT_NAME "Tareeqa POS"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "Tareeqa Technologies"
!define PRODUCT_WEB_SITE "http://tareeqa-pos.com"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\TareeqaPOS.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

;--------------------------------
; Installer Configuration
;--------------------------------
Name "${PRODUCT_NAME}"
OutFile "TareeqaPOS-Setup.exe"
InstallDir "$PROGRAMFILES\Tareeqa POS"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel admin
SetCompressor /SOLID lzma

;--------------------------------
; Version Information
;--------------------------------
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey "ProductVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileDescription" "نظام نقاط البيع المتقدم للشركات المصرية - Advanced POS System for Egyptian Businesses"
VIAddVersionKey "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey "LegalCopyright" "© 2024 Tareeqa Technologies. All rights reserved."

;--------------------------------
; Modern UI Configuration
;--------------------------------
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\nsis3-metro.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\nsis3-metro.bmp"

;--------------------------------
; Installer Pages
;--------------------------------
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\TareeqaPOS.exe"
!define MUI_FINISHPAGE_RUN_TEXT "تشغيل طريقة POS الآن - Launch Tareeqa POS now"
!insertmacro MUI_PAGE_FINISH

;--------------------------------
; Uninstaller Pages
;--------------------------------
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

;--------------------------------
; Languages (Arabic first for Egyptian market)
;--------------------------------
!insertmacro MUI_LANGUAGE "Arabic"
!insertmacro MUI_LANGUAGE "English"

;--------------------------------
; Language Strings - Arabic
;--------------------------------
LangString DESC_SecMain ${LANG_ARABIC} "ملفات التطبيق الأساسية (مطلوب)"
LangString DESC_SecVCRedist ${LANG_ARABIC} "مكتبات Visual C++ المطلوبة (يُنصح بها)"
LangString DESC_SecShortcuts ${LANG_ARABIC} "اختصارات سطح المكتب وقائمة ابدأ"
LangString WELCOME_TEXT ${LANG_ARABIC} "مرحباً بك في معالج تثبيت ${PRODUCT_NAME}$\r$\n$\r$\nنظام نقاط البيع المتقدم للشركات المصرية$\r$\n$\r$\nسيقوم هذا المعالج بتثبيت ${PRODUCT_NAME} على جهاز الكمبيوتر الخاص بك.$\r$\n$\r$\nيُنصح بإغلاق جميع التطبيقات الأخرى قبل المتابعة."
LangString WIN7_REQUIRED ${LANG_ARABIC} "❌ هذا البرنامج يتطلب Windows 7 SP1 أو أحدث$\r$\n$\r$\nنظام التشغيل الحالي غير مدعوم.$\r$\nيرجى ترقية نظام التشغيل والمحاولة مرة أخرى."
LangString VCREDIST_INSTALLING ${LANG_ARABIC} "جاري تثبيت مكتبات Visual C++ المطلوبة..."
LangString INSTALL_COMPLETE ${LANG_ARABIC} "تم تثبيت ${PRODUCT_NAME} بنجاح!$\r$\n$\r$\nيمكنك الآن تشغيل البرنامج من سطح المكتب أو قائمة ابدأ."
LangString UNINSTALL_CONFIRM ${LANG_ARABIC} "هل أنت متأكد من إلغاء تثبيت ${PRODUCT_NAME}؟$\r$\n$\r$\nسيتم حذف جميع ملفات البرنامج والإعدادات."

;--------------------------------
; Language Strings - English
;--------------------------------
LangString DESC_SecMain ${LANG_ENGLISH} "Main application files (required)"
LangString DESC_SecVCRedist ${LANG_ENGLISH} "Visual C++ Runtime Libraries (recommended)"
LangString DESC_SecShortcuts ${LANG_ENGLISH} "Desktop and Start Menu shortcuts"
LangString WELCOME_TEXT ${LANG_ENGLISH} "Welcome to the ${PRODUCT_NAME} Setup Wizard$\r$\n$\r$\nAdvanced Point of Sale System for Egyptian Businesses$\r$\n$\r$\nThis wizard will guide you through the installation of ${PRODUCT_NAME}.$\r$\n$\r$\nIt is recommended that you close all other applications before continuing."
LangString WIN7_REQUIRED ${LANG_ENGLISH} "❌ This software requires Windows 7 SP1 or later$\r$\n$\r$\nYour current operating system is not supported.$\r$\nPlease upgrade your OS and try again."
LangString VCREDIST_INSTALLING ${LANG_ENGLISH} "Installing required Visual C++ Runtime Libraries..."
LangString INSTALL_COMPLETE ${LANG_ENGLISH} "${PRODUCT_NAME} has been installed successfully!$\r$\n$\r$\nYou can now launch the application from Desktop or Start Menu."
LangString UNINSTALL_CONFIRM ${LANG_ENGLISH} "Are you sure you want to uninstall ${PRODUCT_NAME}?$\r$\n$\r$\nAll program files and settings will be removed."

;--------------------------------
; Installer Initialization
;--------------------------------
Function .onInit
  ; Language selection
  !insertmacro MUI_LANGDLL_DISPLAY
  
  ; Check Windows version - Block Vista and older
  ${IfNot} ${AtLeastWin7}
    MessageBox MB_ICONSTOP|MB_TOPMOST "$(WIN7_REQUIRED)"
    Abort
  ${EndIf}
  
  ; Check if already running
  System::Call 'kernel32::CreateMutex(i 0, i 0, t "TareeqaPOSInstaller") i .r1 ?e'
  Pop $R0
  ${If} $R0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "المثبت يعمل بالفعل$\r$\nInstaller is already running."
    Abort
  ${EndIf}
  
  ; Check for existing installation
  ReadRegStr $R0 HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
  ${If} $R0 != ""
    MessageBox MB_YESNO|MB_ICONQUESTION "تم العثور على إصدار سابق. هل تريد إلغاء تثبيته أولاً؟$\r$\nPrevious version found. Uninstall it first?" IDNO +8
    ExecWait '$R0 _?=$INSTDIR'
    ${If} ${Errors}
      MessageBox MB_ICONSTOP "فشل في إلغاء التثبيت$\r$\nUninstall failed"
      Abort
    ${EndIf}
    Delete "$INSTDIR\Uninstall.exe"
    RMDir $INSTDIR
  ${EndIf}
FunctionEnd

;--------------------------------
; Main Installation Section
;--------------------------------
Section "!${PRODUCT_NAME}" SEC01
  SectionIn RO
  SetOutPath "$INSTDIR"
  SetOverwrite on
  
  ; Install main application files
  ; Replace this with your actual built files
  File /r "dist\*.*"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Registry entries for Windows integration
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\TareeqaPOS.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\TareeqaPOS.exe"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKLM "${PRODUCT_UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "${PRODUCT_UNINST_KEY}" "NoRepair" 1
  
  ; Windows 7 Compatibility Registry Settings
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\TareeqaPOS.exe" "WIN7RTM HIGHDPIAWARE"
  
  ; High DPI awareness for modern displays
  WriteRegDWORD HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\SideBySide" "PreferExternalManifest" 1
  
  ; File associations (optional)
  WriteRegStr HKLM "SOFTWARE\Classes\.tpos" "" "TareeqaPOS.Document"
  WriteRegStr HKLM "SOFTWARE\Classes\TareeqaPOS.Document" "" "Tareeqa POS Document"
  WriteRegStr HKLM "SOFTWARE\Classes\TareeqaPOS.Document\DefaultIcon" "" "$INSTDIR\TareeqaPOS.exe,0"
SectionEnd

;--------------------------------
; Visual C++ Redistributables Section
;--------------------------------
Section "Visual C++ Runtime" SEC02
  DetailPrint "$(VCREDIST_INSTALLING)"
  SetOutPath "$TEMP"
  
  ; Download and install appropriate VC++ redistributable
  ${If} ${RunningX64}
    ; For 64-bit systems
    NSISdl::download "https://aka.ms/vs/17/release/vc_redist.x64.exe" "$TEMP\vc_redist.x64.exe"
    Pop $R0
    ${If} $R0 == "success"
      DetailPrint "Installing Visual C++ Redistributable (x64)..."
      ExecWait '"$TEMP\vc_redist.x64.exe" /quiet /norestart' $0
      Delete "$TEMP\vc_redist.x64.exe"
      ${If} $0 != 0
        DetailPrint "Warning: VC++ installation returned code $0"
      ${EndIf}
    ${Else}
      DetailPrint "Failed to download VC++ redistributable. Please install manually."
    ${EndIf}
  ${Else}
    ; For 32-bit systems
    NSISdl::download "https://aka.ms/vs/17/release/vc_redist.x86.exe" "$TEMP\vc_redist.x86.exe"
    Pop $R0
    ${If} $R0 == "success"
      DetailPrint "Installing Visual C++ Redistributable (x86)..."
      ExecWait '"$TEMP\vc_redist.x86.exe" /quiet /norestart' $0
      Delete "$TEMP\vc_redist.x86.exe"
      ${If} $0 != 0
        DetailPrint "Warning: VC++ installation returned code $0"
      ${EndIf}
    ${Else}
      DetailPrint "Failed to download VC++ redistributable. Please install manually."
    ${EndIf}
  ${EndIf}
SectionEnd

;--------------------------------
; Shortcuts Section
;--------------------------------
Section "اختصارات - Shortcuts" SEC03
  ; Start Menu shortcuts with Arabic support
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\${PRODUCT_NAME}.lnk" "$INSTDIR\TareeqaPOS.exe" "" "$INSTDIR\TareeqaPOS.exe" 0 SW_SHOWNORMAL "" "نظام نقاط البيع المتقدم - Advanced POS System"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\إلغاء التثبيت - Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0 SW_SHOWNORMAL "" "إلغاء تثبيت طريقة POS"
  
  ; Desktop shortcut
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\TareeqaPOS.exe" "" "$INSTDIR\TareeqaPOS.exe" 0 SW_SHOWNORMAL "" "نظام نقاط البيع المتقدم - Advanced POS System"
  
  ; Quick Launch shortcut (if Quick Launch exists)
  IfFileExists "$APPDATA\Microsoft\Internet Explorer\Quick Launch" 0 +2
  CreateShortCut "$APPDATA\Microsoft\Internet Explorer\Quick Launch\${PRODUCT_NAME}.lnk" "$INSTDIR\TareeqaPOS.exe"
SectionEnd

;--------------------------------
; Section Descriptions
;--------------------------------
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC01} $(DESC_SecMain)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC02} $(DESC_SecVCRedist)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC03} $(DESC_SecShortcuts)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
; Uninstaller Functions
;--------------------------------
Function un.onInit
  !insertmacro MUI_UNGETLANGUAGE
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "$(UNINSTALL_CONFIRM)" IDYES +2
  Abort
FunctionEnd

Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "$(INSTALL_COMPLETE)"
FunctionEnd

;--------------------------------
; Uninstaller Section
;--------------------------------
Section Uninstall
  ; Stop the application if running
  DetailPrint "Stopping Tareeqa POS if running..."
  ${nsProcess::KillProcess} "TareeqaPOS.exe" $R0
  Sleep 2000
  
  ; Remove files and directories
  DetailPrint "Removing application files..."
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  DetailPrint "Removing shortcuts..."
  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"
  Delete "$APPDATA\Microsoft\Internet Explorer\Quick Launch\${PRODUCT_NAME}.lnk"
  RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"
  
  ; Remove registry entries
  DetailPrint "Cleaning registry..."
  DeleteRegKey HKLM "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  DeleteRegValue HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" "$INSTDIR\TareeqaPOS.exe"
  DeleteRegKey HKLM "SOFTWARE\Classes\.tpos"
  DeleteRegKey HKLM "SOFTWARE\Classes\TareeqaPOS.Document"
  
  ; Remove application data (optional - ask user)
  MessageBox MB_YESNO|MB_ICONQUESTION "حذف بيانات التطبيق والإعدادات؟$\r$\nDelete application data and settings?" IDNO +3
  RMDir /r "$APPDATA\Tareeqa POS"
  RMDir /r "$LOCALAPPDATA\Tareeqa POS"
  
  SetAutoClose true
SectionEnd

;--------------------------------
; Custom Functions
;--------------------------------
Function LaunchApplication
  Exec '"$INSTDIR\TareeqaPOS.exe"'
FunctionEnd
