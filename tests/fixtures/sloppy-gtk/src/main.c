#include <gtk/gtk.h>

static void activate(GtkApplication *app) {
    GtkWidget *window = gtk_application_window_new(app);
    GtkCssProvider *provider = gtk_css_provider_new();
    gtk_css_provider_load_from_string(provider, "window { background: #7C3AED; }");
    gtk_window_set_child(GTK_WINDOW(window), gtk_button_new_with_label("Open"));
}
