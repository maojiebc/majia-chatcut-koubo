# Repository delivery policy

For every completed development increment in this repository:

1. Run the relevant focused checks and the full release gate when practical.
2. Commit only the intended, verified changes.
3. Fast-forward the local `main` branch to the verified commit.
4. Push `main` to `origin`.
5. Read back the GitHub `main` commit and confirm it exactly matches local `HEAD`.

A development increment is not complete until the GitHub `main` readback succeeds. If authentication, branch protection, CI, network access, or divergence prevents the push, report the work as not fully delivered and state the exact blocker.

This policy treats GitHub `main` as the formal code backup. It does not authorize automatic ClawHub releases, media uploads, video-platform publishing, or other external business actions.
