# caqmsApp
Web / Mobile App repository for Continuous Ambient Air Quality Monitoring System (CAAQMS)

Pre-requisite :

1) Ubuntu 16.03.XX LTS

2) Node 6.0 upwards

If hosted on Azure or AWS or GCP, select NodeJS version 6.0 or higher

If hosted on a VM instance running Ubuntu, install NodeJS

caaqms@ubuntu-2gb-nyc3-01:~# curl -sL https://deb.nodesource.com/setup_7.x | sudo bash -
caaqms@ubuntu-2gb-nyc3-01:~# sudo apt-get install nodejs -y

Installation :

Untar code tarball in VM instance running Ubuntu. Start npm with root privilege

caaqms@ubuntu-2gb-nyc3-01:~# cd caaqmsApp
caaqms@ubuntu-2gb-nyc3-01:~/caaqmsApp# sudo npm start

To run the caaqmsApp in service mode, use forever service

caaqms@ubuntu-2gb-nyc3-01:~/caaqmsApp# $ sudo npm install forever -g
caaqms@ubuntu-2gb-nyc3-01:~/caaqmsApp# $ sudo npm install forever-service -g

caaqms@ubuntu-2gb-nyc3-01:~/caaqmsApp# sudo forever-service install caaqmsApp --script bin/www


Active Directory -> Properties : Copy the Dirctory ID

View My Bill -> Subscriptions : Copy Subscription ID

Subscriptions -> <specific Subscription> -> Access Control (IAM) -> add webApp as app user
Subscriptions -> <specific Subscription> -> Resource Providers -> Register for Microsoft.StreamAnalytics
