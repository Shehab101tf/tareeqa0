module.exports = {
  packagerConfig: {
    name: 'Tareeqa POS',
    executableName: 'tareeqa-pos',
    icon: './resources/icon',
    asar: true,
    asarUnpack: '**/*.{node,dll}',
    extraResource: ['./resources/'],
    ignore: [
      /^\/src/,
      /^\/\.vscode/,
      /^\/\.git/,
      /^\/node_modules\/(?!better-sqlite3|node-machine-id)/,
    ],
    win32metadata: {
      CompanyName: 'Tareeqa Solutions',
      FileDescription: 'Professional Point of Sale System',
      ProductName: 'Tareeqa POS',
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'tareeqa_pos',
        setupIcon: './resources/icon.ico',
        setupExe: 'TareeqaPOSSetup.exe',
        noMsi: true,
        certificateFile: process.env.CERTIFICATE_FILE,
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
      config: {
        name: 'TareeqaPOS-Portable'
      }
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        language: 1033, // English
        manufacturer: 'Tareeqa Solutions',
        name: 'Tareeqa POS',
        shortName: 'TareeqaPOS',
        version: '1.0.0',
        upgradeCode: '{12345678-1234-1234-1234-123456789012}',
        ui: {
          chooseDirectory: true,
          images: {
            background: './resources/installer-bg.bmp',
            banner: './resources/installer-banner.bmp'
          }
        },
        beforeCreate: (msiCreator) => {
          // Add custom registry entries for license validation
          msiCreator.wixTemplate = msiCreator.wixTemplate.replace(
            '</Product>',
            `
            <DirectoryRef Id="TARGETDIR">
              <Component Id="RegistryEntries" Guid="{87654321-4321-4321-4321-210987654321}">
                <RegistryKey Root="HKLM" Key="SOFTWARE\\Tareeqa\\POS">
                  <RegistryValue Type="string" Name="InstallPath" Value="[INSTALLDIR]" />
                  <RegistryValue Type="string" Name="Version" Value="1.0.0" />
                </RegistryKey>
              </Component>
            </DirectoryRef>
            </Product>`
          );
        }
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'tareeqa',
          name: 'pos-system'
        },
        prerelease: false,
        draft: true
      }
    }
  ]
};
