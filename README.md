#### 首先安装依赖：

```
apt-get install -y wget libcurl4-openssl-dev libevent-dev ca-certificates libssl-dev pkg-config build-essential intltool libxml2-dev libgcrypt-dev libssl-dev

apt-get update

apt-get install -y make gcc g++ sed vim git sed nettle-dev libgmp-dev libssh2-1-dev libc-ares-dev libxml2-dev zlib1g-dev libsqlite3-dev pkg-config libgpg-error-dev libssl-dev libexpat1-dev libxml2-dev libcppunit-dev autoconf automake autotools-dev autopoint libtool libxml2-dev openssl gettext

```
#### 然后下载aria2最新版源码

```
sudo wget https://github.com/aria2/aria2/releases/download/release-1.32.0/aria2-1.32.0.tar.gz
tar -zxvf aria2-1.32.0.tar.gz
cd aria2-1.32.0
sudo ./configure
sudo make
```

[解決軟件編譯時出現”g++: internal compiler error: Killed”](https://npchk.info/%E8%A7%A3%E6%B1%BA%E8%BB%9F%E4%BB%B6%E7%B7%A8%E8%AD%AF%E6%99%82%E5%87%BA%E7%8F%BEg-internal-compiler-error-killed/)

曾在DigitalOcean 512M VPS編譯Aria2時遇到下列的報錯：

```shell
{standard input}: Assembler messages:
{standard input}:1907: Warning: end of file in string; '"' inserted
g++: internal compiler error: Killed (program cc1plus)
Please submit a full bug report,
with preprocessed source if appropriate.
See file:///usr/share/doc/gcc-4.9/README.Bugs for instructions.
Makefile:2291: recipe for target 'OptionHandlerFactory.lo' failed
```

其後發現引起錯誤的原因是512MB Ram，需要更多的Ram以進行編譯

增加2G Swap即可解決問題

```shell
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
swapon -s   #檢查Swap是否生效
```

编译完成后，进入/aria2-1.23.0/src目录，有一个文件名为aria2c的文件，复制到bin目录

```
sudo cp ~/aria2-1.23.0/src/aria2c /usr/bin
```

对aria2配置文件进行设置

在/etc里新建一个aria2的目录

`sudo mkdir -p /etc/aria2`

写入配置

`sudo nano /etc/aria2/aria2.conf`

```shell
## 启动
aria2c --conf-path=/root/.aria2/aria2.conf
aria2c --conf-path=/root/.aria2/aria2.conf -D
## 关闭
killall aria2c
ps aux | grep aria2
```