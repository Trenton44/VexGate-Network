echo "fetching manifest"
mkdir -p fastify_backend/bungie_api/manifest_files
curl https://raw.githubusercontent.com/Bungie-net/api/master/openapi.json > fastify_backend/bungie_api/openapi.json
curl https://www.bungie.net/Platform/Destiny2/Manifest/ > fastify_backend/bungie_api/manifest.json
#node parse_manifest.js 
curl https://www.bungie.net/common/destiny2_content/json/en/aggregate-4d6ea585-75c4-46c4-96c1-ec25b3db2f05.json > fastify_backend/bungie_api/manifest_files/en/jsonWorldContent.json


