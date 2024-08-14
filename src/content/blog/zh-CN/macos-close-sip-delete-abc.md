---
title: 'Mac 关闭 SIP 并删除自带 ABC 输入法'
date: '2024-8-14'
cover: ''
tag: ['MacOS', 'Other']
---

Mac 装机自带 ABC 和中文输入, 但可用性不是很强, 例如很多开发者需要在编辑器的中文输入法下使用英文符号, 在 Mac 下只有搜狗输入法还行.  

但 Mac 在开启`SIP(系统完整性保护)`时无法将系统自带全部移除, 输入法经常会从搜狗切到 ABC, 很麻烦.

## 关闭 SIP
终端输入
```bash
csrutil status

# 如果已关闭会显示: System Integrity Protection status: disabled.
# 未关闭显示: System Integrity Protection status: enabled.
```
后续步骤: 
* 关机, 然后按住开机键不松手, 直到看见启动选项界面, 选择`选项`
* 点击继续
* 点击左上角, `实用工具` => `终端`
* 输入`csrutil disable`, 回车
* 输入`y`, 回车
* 输入电脑密码, 回车
* 等待结果, 如果是`System Integrity Protection is off`, 就是成功关闭了
* 重启电脑

## 删除 ABC 输入法
删除需要编辑系统的 plist 文件, 常用的编辑器是 xcode 或者[PlistEdit Pro](https://www.fatcatsoftware.com/plisteditpro/). 前者太大, 后者收费, 我推荐一个开源选择[Xplist](https://github.com/ic005k/Xplist/releases/download/1.2.47/Xplist_Mac.dmg), 你可以直接点这个链接下载安装包.  

安装完成后, 先切换输入法到 ABC, 输入命令:
```bash
sudo open -a Xplist ~/Library/Preferences/com.apple.HIToolbox.plist
```
![Xplist](https://r2.ray-d-song.com/2024/08/baadb07e1bf2d972ad33d2cbc632132b.png)
可以看到`AppleEnabledInputSources`选项下几个item, 展开 item 找到`KeyboardLayout Name`为`ABC`的选项, 右键整个item, 选择`remove`.  
按`command S`保存后再重启电脑就可以看到输入选项里没有 ABC 了.