"""
The glowing orb - QGraphicsDropShadowEffect + QPropertyAnimation
recreate the ripple/pulse from the HTML mockup.

TODO: build. This is the piece we haven't started yet.
"""

from PyQt6.QtWidgets import QWidget


class OrbWidget(QWidget):
    def set_state(self, state: str) -> None:
        """state: 'idle' | 'listening' | 'speaking'"""
        raise NotImplementedError("Port the ripple/glow animation from the HTML mockup here.")
