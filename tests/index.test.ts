import { expect } from 'chai';
import { run } from '../publishhtmlreport/index';
import * as tl from 'azure-pipelines-task-lib/task';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

describe('publishhtmlreport', () => {
  beforeEach(() => {
    // Mock the task library functions
    tl.getInput = (name: string, required?: boolean) => {
      if (name === 'htmlType') {
        return 'Jmeter';
      } else if (name === 'JmeterReportsPath') {
        return 'test-reports';
      }
      return '';
    };

    // Mock the file system functions
    fs.readFileSync = (path: string) => {
      if (path === 'test-reports/index.html') {
        return '<html><body><div id="generalInfos"><table><tbody><tr><td></td><td>test.jmx</td></tr></tbody></table></div></body></html>';
      } else if (path === 'test-reports/content/js/dashboard.js') {
        return 'console.log("dashboard.js");';
      } else if (path === 'test-reports/content/js/graph.js') {
        return 'console.log("graph.js");';
      }
      return '';
    };

    // Mock the cheerio load function
    cheerio.load = (html: string) => {
      return cheerio.load(html);
    };
  });

  it('should run the task successfully', async () => {
    await run();
    expect(tl.setResult).to.have.been.calledWith(tl.TaskResult.Succeeded);
  });

  it('should fail the task with bad input', async () => {
    tl.getInput = (name: string, required?: boolean) => {
      if (name === 'htmlType') {
        return 'bad';
      }
      return '';
    };

    await run();
    expect(tl.setResult).to.have.been.calledWith(tl.TaskResult.Failed, 'Bad input was given');
  });
});
