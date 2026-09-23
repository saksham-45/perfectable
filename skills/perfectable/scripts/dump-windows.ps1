param([int]$TargetPid)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$root = [System.Windows.Automation.AutomationElement]::RootElement
$cond = New-Object System.Windows.Automation.PropertyCondition(
  [System.Windows.Automation.AutomationElement]::ProcessIdProperty, $TargetPid)
$app = $root.FindFirst([System.Windows.Automation.TreeScope]::Children, $cond)
if ($null -eq $app) {
  [Console]::Error.WriteLine('process not in UIA tree')
  exit 3
}
$walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
function Walk($el, $depth) {
  if ($null -eq $el -or $depth -gt 5) { return $null }
  $kids = @()
  if ($depth -lt 4) {
    $child = $walker.GetFirstChild($el)
    $n = 0
    while ($null -ne $child -and $n -lt 40) {
      $next = Walk $child ($depth + 1)
      if ($null -ne $next) { $kids += ,$next }
      $child = $walker.GetNextSibling($child)
      $n++
    }
  }
  return [ordered]@{
    role = [string]$el.Current.ControlType.ProgrammaticName
    title = [string]$el.Current.Name
    description = [string]$el.Current.HelpText
    children = $kids
  }
}
Walk $app 0 | ConvertTo-Json -Depth 12 -Compress
