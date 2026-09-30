import UIKit
import Capacitor

// Lets Safari's Web Inspector (Develop menu → device name) attach to this app's
// WKWebView. Off by default since iOS 16.4 — has no effect on App Store builds'
// behavior or review, only on whether a Mac's Safari can inspect a debug/TestFlight
// install the developer is holding.
class MainViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        if #available(iOS 16.4, *) {
            webView?.isInspectable = true
        }
    }
}
