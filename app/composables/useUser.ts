export const useUser = () => {
  // 定义一个全局状态 user
  return useState('user', () => null)
}
