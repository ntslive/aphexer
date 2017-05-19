apt-get update \
	&& DEBIAN_FRONTEND=noninteractive \
	apt-get install -y cmake

git clone https://github.com/itseez/opencv.git /usr/local/src/opencv

cd /usr/local/src/opencv

git checkout ${OPENCV_VERSION} \
	&& mkdir release

cd /usr/local/src/opencv/release

cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local -D WITH_IPP=ON -D INSTALL_CREATE_DISTRIB=ON ..

make && make install

cd /

rm -rf /usr/local/src/opencv \
	&& apt-get purge -y cmake \
	&& apt-get autoremove -y --purge
