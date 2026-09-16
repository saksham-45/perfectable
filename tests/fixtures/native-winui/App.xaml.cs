using Microsoft.UI.Xaml;
using Microsoft.UI.Windowing;
using WinRT.Interop;

namespace WinUIApp;

public partial class App : Application
{
    public static Window? MainWindow { get; private set; }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        MainWindow = new MainWindow();
        MainWindow.Activate();

        // Set up title bar for WinUI 3
        var hwnd = WindowNative.GetWindowHandle(MainWindow);
        var windowId = Win32Interop.GetWindowIdFromWindow(hwnd);
        var appWindow = AppWindow.GetFromWindowId(windowId);
        appWindow.Title = "WinUI App";
        appWindow.SetIcon("Assets/Icon.ico");
    }
}