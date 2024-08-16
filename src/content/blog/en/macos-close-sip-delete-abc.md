---
title: 'Disable SIP on Mac and Remove Built-in ABC Input Method'
date: '2024-8-14'
cover: ''
tag: ['MacOS', 'Other']
---

Mac comes with the ABC and Chinese input methods, but their usability is not very strong. For example, many developers need to use English symbols under the Chinese input method in the editor. On Mac, only the Sogou input method works well.

However, when Mac has `System Integrity Protection (SIP)` enabled, it is not possible to completely remove the built-in input methods. It is often troublesome when the input method switches from Sogou to ABC.

## Disable SIP
Enter the following command in the terminal:
```bash
csrutil status

# if already closed: System Integrity Protection status: disabled.
# otherwise: System Integrity Protection status: enabled.
```
Follow-up steps:
* Shut down the Mac, then press and hold the power button until you see the startup options screen, select `Options`.
* Click Continue.
* Click on the top left corner, `Utilities` => `Terminal`.
* Enter `csrutil disable`, press Enter.
* Enter `y`, press Enter.
* Enter your computer password, press Enter.
* Wait for the result. If it shows `System Integrity Protection is off`, then it has been successfully disabled.
* Restart the Mac.

## Remove ABC Input Method
To remove it, you need to edit the system's plist file. Common editors are Xcode or [PlistEdit Pro](https://www.fatcatsoftware.com/plisteditpro/). The former is too large, and the latter is paid. I recommend an open-source option, [Xplist](https://github.com/ic005k/Xplist/releases/download/1.2.47/Xplist_Mac.dmg). You can directly download the installer by clicking on this link.

After installation, switch the input method to ABC and enter the command:
```bash
sudo open -a Xplist ~/Library/Preferences/com.apple.HIToolbox.plist
```
![Xplist](https://r2.ray-d-song.com/2024/08/baadb07e1bf2d972ad33d2cbc632132b.png)

You will see several items under the `AppleEnabledInputSources` option. Expand the item and find the option with `KeyboardLayout Name` as `ABC`. Right-click on the entire item and select `remove`.
Press `command S` to save and then restart the Mac to see that ABC is no longer in the input options. 

