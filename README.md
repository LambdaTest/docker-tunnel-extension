
# docker-extension-tunnel
This repo holds the code for docker extension tunnel
=======
# tunnel-extension
For extension to work , install docker desktop app 
Then follow these steps after forking this project:

- cd tunnel-extension/ui
- npm i (to install node module dependencies)
- return back to root directory : cd ..

# To build the extension after doing some changes:  
  docker build -t tunnel-extension . 
# To install after building this extension 
  docker extension install tunnel-extension 
# Once installed, after some changes build the extension again and update
  docker extension update tunnel-extension 

# To run the extension in debugger mode
  docker extension dev debug tunnel-extension

