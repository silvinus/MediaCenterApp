import { MediaCenterClientPage } from './app.po';
import {} from 'jasmine';

describe('media-center-client App', () => {
  let page: MediaCenterClientPage;

  beforeEach(() => {
    page = new MediaCenterClientPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
