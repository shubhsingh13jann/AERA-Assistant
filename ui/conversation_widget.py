"""
Scrolling conversation panel - mirrors the "You" / "Signal" message
list from the HTML mockup. Reads history from storage/db.py.

TODO: build.
"""

from PyQt6.QtWidgets import QWidget


class ConversationWidget(QWidget):
    def add_message(self, role: str, text: str) -> None:
        raise NotImplementedError("Render a new message row, same style as the mockup.")
