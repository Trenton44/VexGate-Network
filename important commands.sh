#sudo sysctl -w fs.inotify.max_user_watches=100000


#Gives the manifest file that gives you the link to the file used in the next command
#curl https://www.bungie.net/Platform/Destiny2/Manifest/

#Gives the openapi spec of their api, including request/response schemas (IN THE JSON SCHEMA FORMATTING AAAHHHHHH)
#curl https://raw.githubusercontent.com/Bungie-net/api/master/openapi.json > open_api_spec.json


#can curl the manifest and use this python too to prettify the file. then can read all definitions from it
#curl https://www.bungie.net/common/destiny2_content/json/en/aggregate-4d6ea585-75c4-46c4-96c1-ec25b3db2f05.json | python -mjson.tool > jsonWorldContent.json 