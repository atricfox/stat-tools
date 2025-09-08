/**
 * Basic test to verify Jest framework is working correctly
 */

describe('Jest Framework', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true)
  })

  it('should support async operations', async () => {
    const promise = Promise.resolve('test')
    await expect(promise).resolves.toBe('test')
  })

  it('should have access to DOM matchers', () => {
    document.body.innerHTML = '<div>Test Content</div>'
    expect(document.body).toHaveTextContent('Test Content')
  })
})