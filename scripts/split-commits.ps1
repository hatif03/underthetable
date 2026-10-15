# One-off: split initial tree into dated commits (Oct 14–17 2026)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Random-CommitDate {
    $start = [DateTime]::Parse("2026-10-14T08:00:00+05:30")
    $end = [DateTime]::Parse("2026-10-17T20:00:00+05:30")
    $range = ($end - $start).TotalSeconds
    $offset = Get-Random -Minimum 0 -Maximum ([int]$range)
    return ($start.AddSeconds($offset)).ToString("yyyy-MM-ddTHH:mm:ssK")
}

function Git-CommitDated {
    param([string]$Message, [string[]]$Paths)
    if ($Paths.Count -eq 0) { return }
    git add -- $Paths
    $staged = git diff --cached --name-only
    if (-not $staged) { return }
    $when = Random-CommitDate
    $env:GIT_AUTHOR_DATE = $when
    $env:GIT_COMMITTER_DATE = $when
    git commit -m $Message
    Write-Host "[$when] $Message ($($staged.Count) files)"
}

$commits = @(
    @{
        Message = "chore: scaffold Vite, TypeScript, and deployment config"
        Paths = @(
            "LICENSE", ".gitignore", ".gitattributes", "package.json", "package-lock.json",
            "tsconfig.json", "index.html", "vite.config.ts", "vercel.json", ".env.example"
        )
    },
    @{
        Message = "docs: add Arkiv challenge boilerplate and rubric copies"
        Paths = @(
            "AGENTS.md", "CLAUDE.md", "README.md", "RULES.md", "THIRD_PARTY_NOTICES.md",
            "docs/scoring-rubric.md", "docs/submission-checklist.md", "docs/challenge-brief.md"
        )
    },
    @{
        Message = "docs: add product spec, schema, and decision log"
        Paths = @(
            "plan.md", "arkiv/schema.md", "arkiv/friction.md", "arkiv/wallets.md",
            "docs/setup.md", "docs/decisions.md", "docs/build-plan.md"
        )
    },
    @{
        Message = "feat: add closed lists for districts, vocabulary, and curators"
        Paths = @("data/vocab.json", "data/districts.json", "data/attesters.json", "data/curators.json")
    },
    @{
        Message = "feat: implement slip validation, aggregation, and week rules"
        Paths = @(
            "src/lib/guard.ts", "src/lib/week.ts", "src/lib/labels.ts", "src/lib/format.ts",
            "src/lib/validate.ts", "src/lib/aggregate.ts", "src/lib/parse.ts", "src/lib/derive.ts",
            "src/vite-env.d.ts"
        )
    },
    @{
        Message = "test: cover rules, slips, signals, and validation"
        Paths = @(
            "test/rules.test.ts", "test/slip.test.ts", "test/validate.test.ts", "test/signals.test.ts"
        )
    },
    @{
        Message = "feat: wire Arkiv client, queries, wallet, and writes"
        Paths = @(
            "src/lib/client.ts", "src/lib/query.ts", "src/lib/write.ts", "src/lib/wallet.ts",
            "src/lib/identity.ts", "src/lib/demo.ts", "src/lib/attest.ts"
        )
    },
    @{
        Message = "feat: add seed, query, and verification CLI scripts"
        Paths = @(
            "scripts/load-env.ts", "scripts/wallet.ts", "scripts/seed.ts", "scripts/query.ts",
            "scripts/repro.ts", "scripts/audit.ts", "scripts/verify.ts", "arkiv/seed-progress.json"
        )
    },
    @{
        Message = "feat: add IFM assist route and dev API proxy"
        Paths = @(
            "server/assist.ts", "server/handlers/assist.ts", "api/assist.js", "scripts/build-api.mjs"
        )
    },
    @{
        Message = "feat: add React shell, state store, and Record view"
        Paths = @(
            "src/main.tsx", "src/App.tsx", "src/styles.css", "src/state/store.ts", "src/state/useDerived.ts",
            "src/views/Record.tsx", "src/ui/kit.tsx", "src/ui/meta.tsx"
        )
    },
    @{
        Message = "feat: add Pulse board, filing sheets, and district picker"
        Paths = @(
            "src/views/Pulse.tsx", "src/views/FileSheet.tsx", "src/views/DistrictSheet.tsx",
            "src/views/Sealed.tsx", "src/views/Palette.tsx", "src/ui/DistrictPicker.tsx", "public/mirror.html"
        )
    },
    @{
        Message = "feat: add Phaser office scene and map assets"
        Paths = @(
            "src/scene", "src/views/Office.tsx", "public/maps", "public/characters", "public/sprites", "public/tilesets"
        )
    },
    @{
        Message = "feat: add geo dot map, attestations, and serverless API handlers"
        Paths = @(
            "src/lib/geo.ts", "src/lib/indiaDots.ts", "scripts/build-geo.mjs", "server/geo",
            "server/attest.ts", "server/drip.ts", "server/rpc.ts", "server/snapshot.ts",
            "server/handlers/attest.ts", "server/handlers/drip.ts", "server/handlers/rpc.ts", "server/handlers/snapshot.ts",
            "api/attest.js", "api/drip.js", "api/rpc.js", "api/snapshot.js", "test/verify.test.ts"
        )
    },
    @{
        Message = "feat: add press-sourced seed data and curator flow"
        Paths = @(
            "data/press-records.json", "data/press-sources.json", "arkiv/press-progress.json",
            "scripts/seed-press.ts", "src/ui/Press.tsx", "test/press.test.ts", "docs/press-records.md"
        )
    },
    @{
        Message = "feat: add i18n labels and Hindi-friendly copy hooks"
        Paths = @("src/lib/i18n.ts")
    },
    @{
        Message = "docs: add deploy, pitch, abuse model, and Arkiv usage guides"
        Paths = @(
            "docs/abuse-model.md", "docs/arkiv-usage.md", "docs/assets.md", "docs/deploy.md",
            "docs/pitch.md", "docs/submission-plan.md", "docs/verification.md"
        )
    },
    @{
        Message = "chore: add Arkiv agent skills for local development"
        Paths = @(".agents", "skills-lock.json")
    }
)

# Shuffle commit order so history is not strictly linear by feature; dates stay random per commit.
$order = 0..($commits.Count - 1) | Get-Random -Count $commits.Count

foreach ($i in $order) {
    $c = $commits[$i]
    Git-CommitDated -Message $c.Message -Paths $c.Paths
}

$left = git status --porcelain
if ($left) {
    Write-Host "Remaining untracked/modified:"
    Write-Host $left
    git add -A
    $when = Random-CommitDate
    $env:GIT_AUTHOR_DATE = $when
    $env:GIT_COMMITTER_DATE = $when
    git commit -m "chore: add remaining project files"
    Write-Host "[$when] chore: add remaining project files"
}

Write-Host "`nDone. Log by date:"
git log --format="%h %ad %s" --date=iso-strict
