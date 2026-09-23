use eframe::egui::{CentralPanel, Color32, ScrollArea};

fn ui(ctx: &egui::Context) {
    CentralPanel::default().show(ctx, |ui| {
        ui.painter().rect_filled(ui.max_rect(), 0.0, Color32::from_rgb(124, 58, 237));
        ScrollArea::vertical().show(ui, |ui| {
            for file in ["a.rs", "b.rs"] {
                ui.label(file);
            }
        });
    });
}
