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
      !link.href.includes('olivefreelibrary.org') &&
      !link.href.endsWith('#')
    );
    
    const contentLinkCount = contentLinks.length;
    const timestamp = new Date().toLocaleString();
    
    console.log(`[${timestamp}] Total links found: ${links.length}`);
    console.log(`[${timestamp}] Content links count: ${contentLinkCount}`);
    
    // Save the results to a log file
    const logPath = path.join(__dirname, 'link-count-log.txt');
    const logMessage = `${timestamp} - Total links: ${links.length}, Content links: ${contentLinkCount}\n`;
    
    require('fs').appendFileSync(logPath, logMessage);
    
    // Check if content links count is below threshold
    if (contentLinkCount < 7) {
      console.log(`[${timestamp}] WARNING: Link count is below threshold (${contentLinkCount} < 7)`);
      
      // Show macOS notification
      const title = "Olive Library Links Alert";
      const message = `Only ${contentLinkCount} links found - below minimum threshold of 7!`;
      
      showMacOSNotification(title, message);
    }
    
    // Take a screenshot for reference
    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'latest-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
  } catch (error) {
    console.error('An error occurred:', error);
    showMacOSNotification("Link Checker Error", "Failed to check links. See log for details.");
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed.');
  }
}

// Function to show macOS notification
function showMacOSNotification(title, message) {
  const script = `osascript -e 'display notification "${message}" with title "${title}" sound name "Basso"'`;
  exec(script, (error) => {
    if (error) {
      console.error(`Error showing notification: ${error}`);
    }
  });
}

// Run the function
countLinks();