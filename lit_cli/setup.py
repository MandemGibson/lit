from setuptools import setup, find_packages

setup(
    name="lit-cli",
    version="0.1.0",
    description="A cli tool for lit envs platform",
    # long_description=open("README.md").read(),
    # long_description_content_type="text/markdown",
    author="ethenkem",
    author_email="ethenatx@gmail.com",
    url="https://github.com/ethenkem/lit-envs-source-code/tree/main/lit_cli",
    packages=find_packages(),
    install_requires=["click", "toml", "Halo"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
    ],
    python_requires=">=3.6",
)
