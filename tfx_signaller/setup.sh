# setup script for the signalling Server
# Run this scriopt using sudo sh setup.sh command

echo "Setting up Server enviornment for Running TFX "

echo "---------> Installing redis Server"
cd ~
wget http://download.redis.io/releases/redis-3.0.7.tar.gz
tar xzf redis-3.0.7.tar.gz
cd redis-3.0.7
make
# make test
cd ~/redis-3.0.7/src
./redis-server