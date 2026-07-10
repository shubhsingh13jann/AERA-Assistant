"""
PyQt6 main window - always-on-top overlay hosting the orb and the
conversation panel. This is the entry point stub; full build is the
next step once the wake word + STT loop is solid.

pip install PyQt6
"""

from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QApplication, QHBoxLayout, QMainWindow, QWidget

from ui.orb_widget import OrbWidget
from ui.conversation_widget import ConversationWidget


class SignalOverlay(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowFlags(Qt.WindowType.WindowStaysOnTopHint | Qt.WindowType.FramelessWindowHint)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        central = QWidget()
        layout = QHBoxLayout(central)
        layout.addWidget(OrbWidget())
        layout.addWidget(ConversationWidget())
        self.setCentralWidget(central)


def run():
    app = QApplication([])
    window = SignalOverlay()
    window.show()
    app.exec()
