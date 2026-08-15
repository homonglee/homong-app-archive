import struct
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "assets" / "hoyeon-jijae-logo.png"


class HeaderLogoTests(unittest.TestCase):
    def test_hoyeon_jijae_logo_is_square_rgba_png(self):
        self.assertTrue(LOGO.is_file())
        data = LOGO.read_bytes()
        self.assertEqual(data[:8], b"\x89PNG\r\n\x1a\n")
        width, height, bit_depth, color_type = struct.unpack(">IIBB", data[16:26])
        self.assertEqual((width, height), (512, 512))
        self.assertEqual(bit_depth, 8)
        self.assertEqual(color_type, 6)  # RGBA

    def test_header_uses_accessible_hoyeon_jijae_logo(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('class="brand-logo"', html)
        self.assertIn('src="/assets/hoyeon-jijae-logo.png"', html)
        self.assertIn('alt="호연지재 로고"', html)
        self.assertIn('width="40" height="40"', html)
        self.assertIn('.brand-logo{', html)
        self.assertNotIn('<span class="brand-mark">⌘</span>', html)


if __name__ == "__main__":
    unittest.main()
