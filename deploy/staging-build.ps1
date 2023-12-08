$projectDirectory = "C:\Users\horaz\Documents\GitHub\agro-gis"
cd $projectDirectory

# Go to the server directory and build the app
cd ./server
npm run build

# Go to the deploy directory and create the image and start the container
cd ../deploy
docker compose up --build
