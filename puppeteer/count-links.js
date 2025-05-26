const puppeteer = require('puppeteer');
const path = require('path');
const { exec } = require('child_process');

async function countLinks() {
  console.log('Starting browser...');
  
  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: "new", // Use the new headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport for better rendering
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to Olive Library Links website...');
    // Navigate to the Olive Library Links website
    await page.goto('https://olivelibrarylinks.vercel.app/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for links to load on the page
    await page.waitForSelector('a', { timeout: 10000 });
    
    // Extract all links on the page
    const links = await page.evaluate(() => {
      // Get all <a> tags on the page
      const allLinks = Array.from(document.querySelectorAll('a'));
      
      // Map the links to their href and text content
      return allLinks.map(link => ({
        href: link.href,
        text: link.textContent.trim()
      }));
    });
    
    // Count only content links (excluding social media and navigation links)
    const contentLinks = links.filter(link => 
      !link.href.includes('instagram.com') && 
      !link.href.includes('facebook.com') && 
      !link.href.includes('olivefreelibrary.org')
    );
    
    const contentLinkCount = contentLinks.length;
    const timestamp = new Date().toLocaleString();
    
    console.log(`[${timestamp}] Total links found: ${links.length}`);
    console.log(`[${timestamp}] Content links count: ${contentLinkCount}`);
    console.log(`FINAL_LINK_COUNT: ${contentLinkCount}`); // Output for GitHub Action
    
    // Save the results to a log file
    const logPath = path.join(__dirname, 'link-count-log.txt');
    const logMessage = `${timestamp} - Total links: ${links.length}, Content links: ${contentLinkCount}\n`;
    
    require('fs').appendFileSync(logPath, logMessage);
    
    // Check if content links count is below threshold
    if (contentLinkCount < 1) { // Changed threshold to 1
      console.log(`[${timestamp}] WARNING: Link count is below threshold (${contentLinkCount} < 1)`);
      // Removed macOS notification
      process.exitCode = 1; // Set exit code to indicate failure
    }
    
    // Take a screenshot for reference
    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'latest-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
  } catch (error) {
    console.error('An error occurred:', error);
    // Removed macOS notification
    process.exitCode = 1; // Set exit code to indicate failure
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the function
countLinks();