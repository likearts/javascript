import { LikeartsPage } from './app.po';

describe('likearts App', () => {
  let page: LikeartsPage;

  beforeEach(() => {
    page = new LikeartsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
