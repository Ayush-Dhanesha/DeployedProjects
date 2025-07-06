# Git and Vercel Deployment Helper Scripts

# Git Push Commands
function Push-ToGit {
    param (
        [Parameter(Mandatory=$true)]
        [string]$CommitMessage,
        
        [Parameter(Mandatory=$false)]
        [string]$Branch = "main"
    )
    
    Write-Host "Adding all files to git..." -ForegroundColor Cyan
    git add .
    
    Write-Host "Committing changes with message: $CommitMessage" -ForegroundColor Cyan
    git commit -m "$CommitMessage"
    
    Write-Host "Pushing to $Branch branch..." -ForegroundColor Cyan
    git push -u origin $Branch
    
    Write-Host "Git push completed!" -ForegroundColor Green
}

# Vercel Deployment Command
function Deploy-ToVercel {
    param (
        [Parameter(Mandatory=$false)]
        [switch]$Production
    )
    
    if ($Production) {
        Write-Host "Deploying to Vercel production environment..." -ForegroundColor Yellow
        vercel --prod
    } else {
        Write-Host "Deploying to Vercel preview environment..." -ForegroundColor Cyan
        vercel
    }
}

# Combined push and deploy
function Push-And-Deploy {
    param (
        [Parameter(Mandatory=$true)]
        [string]$CommitMessage,
        
        [Parameter(Mandatory=$false)]
        [string]$Branch = "main",
        
        [Parameter(Mandatory=$false)]
        [switch]$Production
    )
    
    Push-ToGit -CommitMessage $CommitMessage -Branch $Branch
    Deploy-ToVercel -Production:$Production
}

Write-Host "Git and Vercel helper functions loaded!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  Push-ToGit -CommitMessage 'Your commit message' [-Branch 'branch-name']" -ForegroundColor White
Write-Host "  Deploy-ToVercel [-Production]" -ForegroundColor White
Write-Host "  Push-And-Deploy -CommitMessage 'Your commit message' [-Branch 'branch-name'] [-Production]" -ForegroundColor White
Write-Host ""
Write-Host "Example:" -ForegroundColor Yellow
Write-Host "  Push-And-Deploy -CommitMessage 'Fixed AI analysis system' -Production" -ForegroundColor White
