export default () => ({
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    clientURL: process.env.CLIENT_URL,
    APIMethod: process.env.CLIENT_API_METHOD,
});
