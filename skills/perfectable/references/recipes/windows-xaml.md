# Windows XAML (WinUI 3 & WPF) Recipes

Prescriptive layout and styling recipes for AI-generated Windows desktop interfaces.

## 1. Symmetrical 2-Column Form Layout

### ❌ Slop (Ragged Zig-Zag Inputs)
```xml
<!-- DON'T: StackPanel rows cause inputs to zig-zag based on label string length -->
<StackPanel>
    <StackPanel Orientation="Horizontal" Margin="0,0,0,8">
        <TextBlock Text="Name:"/>
        <TextBox Margin="10,0,0,0"/>
    </StackPanel>
    <StackPanel Orientation="Horizontal" Margin="0,0,0,8">
        <TextBlock Text="Email Address:"/>
        <TextBox Margin="10,0,0,0"/>
    </StackPanel>
</StackPanel>
```

### ✅ Clean (2-Column Shared Axis Grid)
```xml
<!-- DO: 2-column Grid gives labels and inputs shared vertical alignment rails -->
<Grid Margin="16">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto"/>
        <ColumnDefinition Width="*"/>
    </Grid.ColumnDefinitions>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
    </Grid.RowDefinitions>

    <TextBlock Grid.Row="0" Grid.Column="0" Text="Name:" VerticalAlignment="Center" Margin="0,0,12,8"/>
    <TextBox Grid.Row="0" Grid.Column="1" CornerRadius="4" Margin="0,0,0,8"/>

    <TextBlock Grid.Row="1" Grid.Column="0" Text="Email Address:" VerticalAlignment="Center" Margin="0,0,12,8"/>
    <TextBox Grid.Row="1" Grid.Column="1" CornerRadius="4" Margin="0,0,0,8"/>

    <Button Grid.Row="2" Grid.Column="1" Content="_Save" CornerRadius="4" Margin="0,8,0,0" Style="{StaticResource AccentButtonStyle}"/>
</Grid>
```

---

## 2. High-Contrast & Theme Resource Brushes

### ❌ Slop (Hardcoded Hex Colors)
```xml
<!-- DON'T: Breaks Windows Dark Mode and destroys High Contrast accessibility -->
<Grid Background="#1E1E1E">
    <TextBlock Text="Settings" Foreground="#FFFFFF"/>
    <Border BorderBrush="#333333"/>
</Grid>
```

### ✅ Clean (Fluent 2 Theme Resources)
```xml
<!-- DO: Respects system appearance and high contrast automatically -->
<Grid Background="{ThemeResource ApplicationPageBackgroundThemeBrush}">
    <TextBlock Text="Settings" Foreground="{ThemeResource TextFillColorPrimaryBrush}" Style="{ThemeResource TitleTextBlockStyle}"/>
    <Border BorderBrush="{ThemeResource CardStrokeColorDefaultBrush}"/>
</Grid>
```

---

## 3. Virtualized List vs StackPanel Scroll

### ❌ Slop (Disables UI Virtualization)
```xml
<!-- DON'T: StackPanel in ScrollViewer materializes every row, freezing on large sets -->
<ScrollViewer Height="400">
    <StackPanel>
        <ItemsControl ItemsSource="{Binding Files}"/>
    </StackPanel>
</ScrollViewer>
```

### ✅ Clean (Virtualized ListView / ItemsRepeater)
```xml
<!-- DO: ListView automatically virtualizes off-screen rows -->
<ListView ItemsSource="{x:Bind Files}">
    <ListView.ItemTemplate>
        <DataTemplate>
            <Grid Height="32" Padding="8,4">
                <TextBlock Text="{Binding Name}" VerticalAlignment="Center"/>
            </Grid>
        </DataTemplate>
    </ListView.ItemTemplate>
</ListView>
```

---

## 4. Dialog Keyboard Bindings

### ❌ Slop (Keyboard Trapped / Unbound)
```xml
<!-- DON'T: User cannot press Enter to confirm or Escape to cancel -->
<ContentDialog Title="Confirm Delete" PrimaryButtonText="Delete" CloseButtonText="Cancel"/>
```

### ✅ Clean (Bound Default and Cancel Actions)
```xml
<!-- DO: DefaultButton="Primary" binds Enter key; CloseButton binds Esc -->
<ContentDialog
    Title="Confirm Delete"
    PrimaryButtonText="Delete"
    CloseButtonText="Cancel"
    DefaultButton="Primary"/>
```

For custom Window dialogs:
```xml
<Button Content="_OK" IsDefault="True" Click="Ok_Click"/>
<Button Content="_Cancel" IsCancel="True" Click="Cancel_Click"/>
```

---

## 5. Window Sizing & Sovereign Layout

### ❌ Slop (Collapsible to 0x0, Stretched Toolbars)
```xml
<!-- DON'T: No min size, toolbar set to star height so buttons stretch -->
<Window>
    <Grid>
        <ToolBarTray Height="*">
            <ToolBar><Button Content="Play"/></ToolBar>
        </ToolBarTray>
    </Grid>
</Window>
```

### ✅ Clean (Protected Minimum Bounds, Sovereign Content Expansion)
```xml
<!-- DO: MinWidth/MinHeight set; toolbar Auto, sovereign workspace * -->
<Window
    MinWidth="800"
    MinHeight="600"
    Title="Tool Workbench">
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <!-- Command bar stays Auto height -->
        <CommandBar Grid.Row="0"/>
        
        <!-- Sovereign workspace absorbs all resize growth -->
        <Grid Grid.Row="1"/>
        
        <!-- Status bar stays Auto / 24px height -->
        <StatusBar Grid.Row="2" Height="24"/>
    </Grid>
</Window>
```
