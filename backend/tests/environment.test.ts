describe('Environment Setup', () => {
  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should be able to perform basic calculations', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });
});
