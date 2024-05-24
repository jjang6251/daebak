# Node.js 이미지 사용
FROM node:21

# 앱 디렉토리 생성
WORKDIR /usr/src/app

# ARG로 환경 변수 파일 경로를 받습니다.
ARG DEVELOPMENT_ENV

# .development.env 파일을 이미지 내부에 복사합니다.
COPY ${DEVELOPMENT_ENV} /usr/src/app/.development.env

# 환경 변수를 설정합니다.
RUN export $(cat /usr/src/app/.development.env | xargs)

# 패키지 파일 복사
COPY package*.json ./

# 패키지 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 앱 실행
CMD [ "npm", "start" ]