echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build --build-arg version="$TRAVIS_TAG" -t collinewait/ttcat:latest .
docker tag collinewait/ttcat:latest collinewait/ttcat:$TRAVIS_TAG
docker push "collinewait/ttcat:latest" && docker push "collinewait/ttcat:$TRAVIS_TAG"