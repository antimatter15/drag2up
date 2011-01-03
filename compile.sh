if [ -e ../addon-sdk*/ ]
then
  echo "Compiling Jetpack Version"
  if [ -e build/jetpack ]
  then
    echo "Cleaning out jetpack directory first"
    rm -r build/jetpack
  fi
  echo "Creating directories"
  mkdir build/jetpack
  mkdir build/jetpack/lib

  cd data
  echo "Calculating dependencies"
  FILES=`cat background.html | sed 's/<script.*src="\([^"]*\).*/\1/' | sed 's/<!.*//' `
  echo "Concatenating scripts"
  #This is actually just because I'm too lazy to CommonJS-ify all my scripts
  cat jetpack.js $FILES > ../build/jetpack/lib/main.js
  echo "Mirroring data directory"
  cd ../
  cp -r data build/jetpack/
  echo "Trimming directory"
  cd build/jetpack/data
  rm jetpack.js $FILES
  mv package.json ../
  echo "Generating XPI"
  cd ..
  ../../../addon-sdk*/bin/cfx xpi --pkgdir .
  echo "Moving XPI"
  mv *.xpi ../
  cd ../../
else
  echo "*********** Jetpack SDK not found. ************"
fi

echo "Compiling Chrome Version"
if [ -e build/chrome ]
then
  echo "Cleaning out chrome directory first"
  rm -r build/chrome
fi
echo "Creating directories"
mkdir build/chrome
echo "Copying data directory"
cp -r data build/chrome
echo "Copying manifest"
cp manifest.json build/chrome
echo "Creating Zip"
cd build/chrome
zip -r drag2up.zip .
echo "Moving Zip"
cd ../../
mv build/chrome/drag2up.zip build/

