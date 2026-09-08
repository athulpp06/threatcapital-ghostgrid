"""Backend package marker for threatcapital-ghostgrid.

Adding an explicit package file prevents "No module named backend" import errors
when launching the app from environments that don't treat implicit namespace
packages consistently.
"""

__all__ = ["main", "layer1", "layer2"]
