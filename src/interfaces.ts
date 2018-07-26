export interface IRepoIssues {
  repository: {
    issues: {
      edges: object[]
      pageInfo: IPaginationInfo
    }
  }
}

export interface IPaginationInfo {
  hasPreviousPage?: boolean
  startCursor?: string
}

export interface IRemoteInfo {
  remote: string
  repo: string
  user: string
}
