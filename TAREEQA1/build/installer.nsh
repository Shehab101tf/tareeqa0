!macro customInstall
  ; Force Windows 7 compatibility + High DPI awareness
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" \
    "$INSTDIR\Tareeqa POS.exe" "WIN7RTM HIGHDPIAWARE"
!macroend
