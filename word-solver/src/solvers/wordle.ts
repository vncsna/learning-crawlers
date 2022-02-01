import puppeteer, { Browser, Page } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

export class WordleSolver {
  /**
   * Puppeteer Page
   */
  private page: Page;

  /**
   * Puppeteer Browser
   */
  private browser: Browser;

  /**
   * Media filepath
   */
  private filepath: string = `${__dirname}/media`;

  /**
   * Game URL
   */
  private URL: string = 'https://www.powerlanguage.co.uk/wordle/';

  /**
   * Start the browser and go to the page
   */
  public async start(): Promise<WordleSolver> {
    this.browser = await puppeteer.launch({ headless: true });
    this.page = await this.browser.newPage();

    /**
     * Go to the main page
     */
    await this.page.goto(this.URL);
    await this.page.waitForTimeout(2000);

    /**
     * Pass by the instruction page.
     * Note that this page has a shadowRoot element.
     * Ref: github.com/puppeteer/puppeteer/issues/858
     */
    const selector = `document.querySelector('game-app').shadowRoot.querySelector('game-theme-manager > #game')`;
    const modal = await this.page.evaluateHandle(selector);
    await modal.asElement()?.click();

    return this;
  }

  /**
   * Solve the game and return solution
   * @param external True if it is an external call
   */
  public async solve(external: boolean = true): Promise<string> {
    const handle = await this.page.evaluateHandle(`JSON.parse(window.localStorage.gameState)`);
    const property = await handle.getProperty('solution');
    const solution = await property.jsonValue() as string;
    
    if (external) { await this.browser.close() }
    
    return solution;
  }

  /**
   * Solve the game and return a screenshot
   */
  public async solveAndScreen(): Promise<string> {
    const solution = await this.solve(false);

    await this.page.keyboard.type(solution, { delay: 1000 });
    await this.page.keyboard.press('Enter', { delay: 1000 });
    await this.page.waitForTimeout(4000);

    await this.page.screenshot({ path: `${this.filepath}.png` });
    
    await this.browser.close();

    return `${this.filepath}.png`;
  }

  /**
   * Solve the game and record the process
   */
   public async solveAndRecord(): Promise<string> {
    const solution = await this.solve(false);
    const recorder = new PuppeteerScreenRecorder(this.page);

    await recorder.start(`${this.filepath}.mp4`);
    await this.page.keyboard.type(solution, { delay: 1000 });
    await this.page.keyboard.press('Enter', { delay: 1000 });
    await this.page.waitForTimeout(4000);

    await recorder.stop();
    await this.browser.close();

    return `${this.filepath}.mp4`;
  }
}