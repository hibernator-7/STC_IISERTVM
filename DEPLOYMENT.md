# How to Deploy and Manage Your Website on GitHub Pages

This guide will walk you through the simple process of deploying your new website using GitHub Pages.

## Step 1: Push Your Code to a GitHub Repository

First, ensure all your website files are pushed to a GitHub repository. If you are reading this, you have likely already done this step.

## Step 2: Enable GitHub Pages

1.  Navigate to your repository on the GitHub website.
2.  Click on the **"Settings"** tab, located on the right side of the navigation bar.
3.  In the left-hand sidebar, click on **"Pages"**.

## Step 3: Configure the Source

Under the "Build and deployment" section, you will see a "Source" option.

1.  Make sure the source is set to **"Deploy from a branch"**.
2.  Under "Branch", select your main branch (it's usually called `main` or `master`).
3.  For the folder, select **"/(root)"**.
4.  Click **"Save"**.

![GitHub Pages Settings](https://i.imgur.com/2m5J2jC.png)
*(Note: This is an example image. Your interface may look slightly different.)*

## Step 4: Access Your Live Website

After you save, GitHub will start the deployment process. It may take a few minutes.

Once it's ready, a green bar will appear at the top of the Pages settings with the URL of your live website. It will look something like this: `https://your-username.github.io/your-repository-name/`.

You can now visit this URL to see your live website!

## Step 5: Updating Your Website

Managing your website is now incredibly simple.

1.  **To update content** (like team members, events, or announcements), simply edit the `js/data.js` file directly in the GitHub interface or on your local machine.
2.  **To make structural or design changes**, you can edit the HTML and CSS files.

Any time you commit and push a change to your `main` branch, GitHub Pages will automatically redeploy your website with the latest changes. Just wait a minute or two, refresh your website's URL, and you will see the updates.

That's it! You now have a fully functional, easy-to-manage website.
