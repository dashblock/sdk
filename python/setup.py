from setuptools import setup

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(name='dashblock',
    version='0.0.2',
    description='Automatation SDK for python',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='http://beta.dashblock.com',
    author='Dashblock',
    author_email='hello@dashblock.com',
    license='MIT',
    packages=['dashblock'],
    python_requires='>=3.6',
    zip_safe=False)