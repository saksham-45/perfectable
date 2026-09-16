using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using System;
using System.IO;
using Windows.Storage;
using Windows.Storage.Pickers;
using WinRT.Interop;

namespace WinUIApp;

public sealed partial class MainWindow : Window
{
    private string? _currentFilePath;
    private bool _isDirty = false;

    public MainWindow()
    {
        InitializeComponent();
        Editor.TextChanged += (s, e) => { _isDirty = true; UpdateTitle(); };
        this.Closed += MainWindow_Closed;
    }

    private void MainWindow_Closed(object sender, WindowEventArgs args)
    {
        if (_isDirty)
        {
            // In a real app, show a dialog to save
        }
    }

    private void UpdateTitle()
    {
        var title = string.IsNullOrEmpty(_currentFilePath) ? "Untitled" : Path.GetFileName(_currentFilePath);
        if (_isDirty) title += " ●";
        Title = $"{title} - WinUI App";
        StatusFile.Text = title;
    }

    // File Menu
    private async void New_Click(object sender, RoutedEventArgs e)
    {
        if (_isDirty) { /* prompt to save */ }
        Editor.Text = "";
        _currentFilePath = null;
        _isDirty = false;
        UpdateTitle();
    }

    private async void Open_Click(object sender, RoutedEventArgs e)
    {
        var picker = new FileOpenPicker();
        var hwnd = WindowNative.GetWindowHandle(this);
        InitializeWithWindow.Initialize(picker, hwnd);
        picker.FileTypeFilter.Add(".txt");
        picker.FileTypeFilter.Add(".md");
        picker.FileTypeFilter.Add("*");
        var file = await picker.PickSingleFileAsync();
        if (file != null)
        {
            Editor.Text = await FileIO.ReadTextAsync(file);
            _currentFilePath = file.Path;
            _isDirty = false;
            UpdateTitle();
        }
    }

    private async void Save_Click(object sender, RoutedEventArgs e)
    {
        if (string.IsNullOrEmpty(_currentFilePath))
        {
            await SaveAs_Click(sender, e);
            return;
        }
        await FileIO.WriteTextAsync(await StorageFile.GetFileFromPathAsync(_currentFilePath), Editor.Text);
        _isDirty = false;
        UpdateTitle();
    }

    private async void SaveAs_Click(object sender, RoutedEventArgs e)
    {
        var picker = new FileSavePicker();
        var hwnd = WindowNative.GetWindowHandle(this);
        InitializeWithWindow.Initialize(picker, hwnd);
        picker.FileTypeChoices.Add("Text File", new[] { ".txt" });
        picker.SuggestedFileName = "Untitled";
        var file = await picker.PickSaveFileAsync();
        if (file != null)
        {
            await FileIO.WriteTextAsync(file, Editor.Text);
            _currentFilePath = file.Path;
            _isDirty = false;
            UpdateTitle();
        }
    }

    private void Exit_Click(object sender, RoutedEventArgs e) => Close();

    // Edit Menu
    private void Undo_Click(object sender, RoutedEventArgs e) => Editor.Undo();
    private void Redo_Click(object sender, RoutedEventArgs e) => Editor.Redo();
    private void Cut_Click(object sender, RoutedEventArgs e) => Editor.Cut();
    private void Copy_Click(object sender, RoutedEventArgs e) => Editor.Copy();
    private void Paste_Click(object sender, RoutedEventArgs e) => Editor.Paste();

    // View Menu
    private void ZoomIn_Click(object sender, RoutedEventArgs e) => Editor.FontSize += 1;
    private void ZoomOut_Click(object sender, RoutedEventArgs e) => Editor.FontSize = Math.Max(8, Editor.FontSize - 1);
    private void ResetZoom_Click(object sender, RoutedEventArgs e) => Editor.FontSize = 14;

    // Help Menu
    private void About_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new ContentDialog
        {
            Title = "About",
            Content = "WinUI App - Native Windows Editor",
            CloseButtonText = "OK",
            XamlRoot = this.Content.XamlRoot
        };
        dialog.ShowAsync();
    }
}