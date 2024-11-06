// OBSUploader.ts
import ObsClient from "esdk-obs-browserjs"

// OBS基础配置
const obsConfig = {
  server: "obs.cn-north-4.myhuaweicloud.com", // 替换为您的 OBS 服务器地址
  bucket: "tb-train-dev", // 替换为您的 bucket 名称
  prefix: "richEditor/" // 文件存储的前缀路径
}

// 获取临时凭证的接口
interface TempCredentials {
  accessKeyId: string
  secretAccessKey: string
  securityToken: string
  expiration: string
}

// 获取临时凭证
const fetchTemporaryCredentials = async (): Promise<TempCredentials> => {
  try {
    const response = await fetch("https://basic-service-api.d1.tb.com/api/oss/token?ossType=HUAWEI") // 替换为您的实际接口
    if (!response.ok) {
      throw new Error("Failed to fetch credentials")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching temporary credentials:", error)
    throw error
  }
}

// 初始化或更新 OBS 客户端
const initObsClient = async () => {
  try {
    const credentials = await fetchTemporaryCredentials()

    return new ObsClient({
      access_key_id: credentials.accessKeyId,
      secret_access_key: credentials.secretAccessKey,
      security_token: credentials.securityToken,
      server: obsConfig.server
    })
  } catch (error) {
    console.error("Failed to initialize OBS client:", error)
    throw error
  }
}

// 获取文件扩展名
const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

// 生成唯一文件名
const generateUniqueFilename = (originalFilename: string): string => {
  const ext = getFileExtension(originalFilename)
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${timestamp}-${random}.${ext}`
}

// 上传文件到华为云 OBS
export const uploadToOBS = async (file: File): Promise<string> => {
  try {
    // 每次上传前确保使用最新的临时凭证
    const client = await initObsClient()

    const uniqueFilename = generateUniqueFilename(file.name)
    const objectKey = `${obsConfig.prefix}${uniqueFilename}`

    const result = await client.putObject({
      Bucket: obsConfig.bucket,
      Key: objectKey,
      Body: file
    })

    if (result.CommonMsg.Status === 200) {
      return `https://${obsConfig.bucket}.${obsConfig.server}/${objectKey}`
    } else {
      throw new Error("Upload failed")
    }
  } catch (error) {
    console.error("OBS upload error:", error)
    throw error
  }
}
