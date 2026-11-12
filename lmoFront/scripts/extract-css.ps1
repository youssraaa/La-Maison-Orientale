$css = Get-Content "$PSScriptRoot\..\src\index.css" -Raw
$pattern = '\.(client-portal[^{]*|client-home[^{]*|client-page[^{]*|client-action[^{]*|client-activity[^{]*)\{[^}]*\}'
$matches = [regex]::Matches($css, $pattern)
Write-Output "count: $($matches.Count)"
$matches | Select-Object -First 20 | ForEach-Object {
    $v = $_.Value
    if ($v.Length -gt 200) { $v = $v.Substring(0, 200) + "..." }
    Write-Output $v
    Write-Output "---"
}
