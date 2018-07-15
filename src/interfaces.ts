export interface IRepoIssues {
  repository: {
    issues: {
      edges: object[]
      pageInfo: {
        hasPreviousPage: boolean
        startCursor: string
      }
    }
  }
}
