// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NativeApp",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "NativeApp", targets: ["NativeApp"])
    ],
    targets: [
        .executableTarget(name: "NativeApp", path: ".")
    ]
)