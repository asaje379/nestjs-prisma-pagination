import { paginate } from '../src/lib';

describe('Pagination', () => {
  it('should paginate with page and limit', () => {
    const query = paginate(
      {
        page: 1,
        limit: 10,
        from: '2023-01-01T00:00:00.000Z',
        to: '2023-12-31T22:59:59.000Z',
        search: 'foo',
      },
      {
        dateAttr: 'at',
        enabled: false,
        includes: ['post', 'user.agent.auth', 'user.agent.info'],
        search: ['fullname', 'reference'],
        orderBy: { fullname: 'asc' },
      },
    );

    console.log(JSON.stringify(query, null, 2));
    expect(Object.keys(query).includes('where'));
  });
});
